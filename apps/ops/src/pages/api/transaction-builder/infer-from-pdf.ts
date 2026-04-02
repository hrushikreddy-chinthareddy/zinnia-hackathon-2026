import { randomUUID } from 'crypto';
import formidable from 'formidable';
import { promises as fs } from 'fs';

import {
    buildCanonicalModelPrompt,
    buildTabSchemaGenerationPrompt,
    buildTabInferencePrompt,
} from '@deps/lib/transaction-builder/pipeline-knowledge-base';
import type {
    ArchetypeContextPack,
    CanonicalModel,
    CanonicalField,
    ExtractionStructuredGroup,
    FullRjsfOutput,
    GenerationQualityReport,
    LlmReadyExtractionPayload,
    Phase2GenerationContext,
    SchemaGenerationResult,
    TabInference,
} from '@deps/lib/transaction-builder/pipeline-types';
import { extractPdfTextAndLayout } from '@deps/server/paper2flow/extract-pdf-text-layout';
import type {
    PdfExtractItemsMode,
    PdfTextLayoutResult,
} from '@deps/server/paper2flow/types';
import { getArchetypeContextPack } from '@deps/server/transaction-builder/archetype-context-retriever';
import { getFixedTabTemplates } from '@deps/server/transaction-builder/fixed-tab-templates';
import { isProd } from '@deps/utils/environment.helpers';
import { openai } from '@deps/utils/openai';

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_SOURCE_FORM_TEXT_CHARS = 50000;

/**
 * Deterministic JSON stringification that sorts object keys alphabetically
 * to ensure consistent LLM input even with temperature=0
 */
function deterministicStringify(obj: unknown, space?: number): string {
    return JSON.stringify(
        obj,
        (key, value) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return Object.keys(value)
                    .sort()
                    .reduce((sorted: Record<string, unknown>, k) => {
                        sorted[k] = value[k];
                        return sorted;
                    }, {});
            }
            return value;
        },
        space
    );
}

type InferFromPdfResponse = {
    extraction: PdfTextLayoutResult;
    llmReadyPayload: LlmReadyExtractionPayload;
    canonicalModel: CanonicalModel;
    archetypeContextPack: ArchetypeContextPack;
    tabInference: TabInference;
    phase2Context: Phase2GenerationContext;
    schemaGeneration: SchemaGenerationResult;
    fullRjsfOutput: FullRjsfOutput;
    qualityReport: GenerationQualityReport;
};

function getFirstUploadedFile(
    files: formidable.Files,
    fieldNames: string[]
): formidable.File | undefined {
    for (const name of fieldNames) {
        const value = files[name];
        if (!value) continue;
        const file = Array.isArray(value) ? value[0] : value;
        if (file) return file;
    }
    return undefined;
}

function getFieldValue(
    fields: formidable.Fields,
    key: string
): string | undefined {
    const value = fields[key];
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
}

function parseItemsMode(value?: string): PdfExtractItemsMode {
    if (value === 'full' || value === 'text' || value === 'none') {
        return value;
    }
    return 'text';
}

function normalizeForLlm(text: string): string {
    const lines = text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter((line) => line !== '')
        .filter(
            (line) =>
                !/^\d+\s+\d{2}\/\d{2}\s*Page\s+\d+\s+of\s+\d+$/i.test(line)
        )
        .filter((line) => !/^[_-]{8,}$/.test(line))
        .filter((line) => !/^%+$/.test(line));

    return lines.join('\n').trim();
}

function collectRepeatedShortLabels(
    lines: string[]
): Array<{ label: string; occurrences: number }> {
    const counts = new Map<string, number>();

    for (const line of lines) {
        if (line.startsWith('[PAGE ')) continue;
        if (line.length < 3 || line.length > 80) continue;
        if (/[.;!?]$/.test(line)) continue;
        if (/^q$/i.test(line)) continue;
        const wordCount = line.split(/\s+/).length;
        if (wordCount > 8) continue;
        counts.set(line, (counts.get(line) ?? 0) + 1);
    }

    return Array.from(counts.entries())
        .filter(([, occurrences]) => occurrences >= 2)
        .map(([label, occurrences]) => ({ label, occurrences }))
        .sort((a, b) =>
            b.occurrences === a.occurrences
                ? a.label.localeCompare(b.label)
                : b.occurrences - a.occurrences
        )
        .slice(0, 20);
}

const STRUCTURED_GROUP_VARIANT_PREFIXES = [
    'primary',
    'contingent',
    'current',
    'new',
    'existing',
    'proposed',
    'previous',
    'former',
    'additional',
    'alternate',
    'joint',
    'successor',
    'first',
    'second',
    'third',
];

function toSnakeCase(value: string): string {
    return value
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_{2,}/g, '_');
}

function splitVariantAndBase(
    line: string
): { variant: string; base: string } | null {
    const normalized = line
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[:;,.]+$/, '');
    if (!normalized) return null;

    const headingOnly = normalized
        .replace(/\([^)]*\)/g, '')
        .split(':')[0]
        ?.split(' - ')[0]
        ?.trim();
    if (!headingOnly) return null;

    const parts = headingOnly.split(' ').filter(Boolean);
    if (parts.length < 2 || parts.length > 8) return null;

    const first = parts[0]?.toLowerCase();
    if (!first || !STRUCTURED_GROUP_VARIANT_PREFIXES.includes(first)) {
        return null;
    }

    const base = parts.slice(1).join(' ');
    if (base.length < 3) return null;
    return { variant: first, base };
}

function inferStructuredGroups(
    lines: string[],
    repeatedLabels: Array<{ label: string; occurrences: number }>
): ExtractionStructuredGroup[] {
    const repeatedSet = new Set(repeatedLabels.map((entry) => entry.label));
    const indexedLines = lines
        .map((line, index) => ({ line, index }))
        .filter((entry) => !entry.line.startsWith('[PAGE '));

    const grouped = new Map<
        string,
        Array<{ variant: string; base: string; line: string; index: number }>
    >();

    for (const entry of indexedLines) {
        const parsed = splitVariantAndBase(entry.line);
        if (!parsed) continue;
        const baseKey = toSnakeCase(parsed.base);
        if (!baseKey) continue;

        const group = grouped.get(baseKey) ?? [];
        group.push({
            variant: parsed.variant,
            base: parsed.base,
            line: entry.line,
            index: entry.index,
        });
        grouped.set(baseKey, group);
    }

    const out: ExtractionStructuredGroup[] = [];
    for (const [baseKey, entries] of Array.from(grouped.entries())) {
        const uniqueVariants = Array.from(
            new Set(entries.map((entry) => entry.variant))
        );
        if (uniqueVariants.length < 2) continue;

        const sorted = [...entries].sort((a, b) => a.index - b.index);
        const rowLabels: string[] = [];
        const rowSeen = new Set<string>();

        for (const entry of sorted) {
            const start = entry.index + 1;
            const end = Math.min(lines.length, entry.index + 28);
            for (let idx = start; idx < end; idx += 1) {
                const candidate = lines[idx]?.trim() ?? '';
                if (!candidate || candidate.startsWith('[PAGE ')) continue;
                if (splitVariantAndBase(candidate)) break;
                if (candidate.length < 3 || candidate.length > 90) continue;
                if (/[.;!?]$/.test(candidate)) continue;
                const wordCount = candidate.split(/\s+/).length;
                if (wordCount > 9) continue;

                if (!repeatedSet.has(candidate) && wordCount > 6) {
                    continue;
                }

                if (!rowSeen.has(candidate)) {
                    rowSeen.add(candidate);
                    rowLabels.push(candidate);
                }
            }
        }

        const rawBaseTitle = toTitleCase(
            sorted[0]?.base ?? baseKey.replace(/_/g, ' ')
        );
        const normalizedGroupKey = toSnakeCase(rawBaseTitle).replace(
            /_(class|group|section|details?)$/,
            ''
        );
        const baseTitle = toTitleCase(
            normalizedGroupKey.replace(/_/g, ' ') || rawBaseTitle
        );
        out.push({
            key: normalizedGroupKey || toSnakeCase(baseTitle),
            title: baseTitle,
            rationale: `Detected ${uniqueVariants.length} variant classes for ${baseTitle}.`,
            variants: uniqueVariants.map((variant) => ({
                key: toSnakeCase(variant),
                title: toTitleCase(variant),
                anchor:
                    sorted.find((entry) => entry.variant === variant)?.line ??
                    toTitleCase(variant),
            })),
            rowFieldLabels: rowLabels
                .slice(0, 24)
                .map((label) => toTitleCase(label)),
        });
    }

    return out.slice(0, 10);
}

function inferCandidateSectionHeaders(
    lines: string[],
    repeatedLabelSet: Set<string>
): Array<{ key: string; title: string; anchor: string }> {
    const seen = new Set<string>();
    const out: Array<{ key: string; title: string; anchor: string }> = [];

    for (const line of lines) {
        if (line.startsWith('[PAGE ')) continue;
        if (repeatedLabelSet.has(line)) continue;
        if (line.length < 8 || line.length > 120) continue;
        const words = line.split(/\s+/);
        if (words.length < 2 || words.length > 14) continue;

        const looksAllCaps =
            line === line.toUpperCase() &&
            /[A-Z]/.test(line) &&
            !/[a-z]/.test(line);
        const looksHeaderWithColon = line.endsWith(':');
        const looksTitleStyle =
            /^[A-Z][A-Za-z0-9/&(), -]+$/.test(line) && words.length >= 3;

        if (!looksAllCaps && !looksHeaderWithColon && !looksTitleStyle) {
            continue;
        }

        const dedupeKey = line.toLowerCase();
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        out.push({
            key: `section_${out.length + 1}`,
            title: line,
            anchor: line,
        });

        if (out.length >= 24) break;
    }

    return out;
}

function inferConstraints(text: string): string[] {
    const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('[PAGE '));

    const patterns = [
        /\bmust\b/i,
        /\brequired\b/i,
        /\bat least\b/i,
        /\bminimum\b/i,
        /\bmaximum\b/i,
        /\bnot to exceed\b/i,
        /\bcannot\b/i,
        /\bshall\b/i,
        /\bonly if\b/i,
    ];

    const out: string[] = [];
    const seen = new Set<string>();
    for (const line of lines) {
        if (!patterns.some((p) => p.test(line))) continue;
        if (seen.has(line)) continue;
        seen.add(line);
        out.push(line);
        if (out.length >= 20) break;
    }
    return out;
}

function toTitleCase(value: string): string {
    return value
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function inferFormNameFromLines(
    lines: string[],
    inferredSections: Array<{ key: string; title: string; anchor: string }>
): string | undefined {
    const candidateLines = lines.filter((line) => !line.startsWith('[PAGE '));

    const score = (line: string): number => {
        let total = 0;
        if (/\bform\b/i.test(line)) total += 6;
        if (/\bchange\b/i.test(line)) total += 3;
        if (line === line.toUpperCase() && /[A-Z]/.test(line)) total += 3;
        if (line.split(/\s+/).length <= 8) total += 2;
        if (line.length >= 8 && line.length <= 80) total += 1;
        if (/[:.;!?]$/.test(line)) total -= 2;
        return total;
    };

    const topLine = candidateLines
        .map((line) => ({ line, score: score(line) }))
        .filter((entry) => entry.score >= 7)
        .sort((a, b) => b.score - a.score)[0]?.line;

    if (topLine) {
        return toTitleCase(topLine);
    }

    const sectionCandidate = inferredSections.find((section) =>
        /\bform\b/i.test(section.title)
    )?.title;
    if (sectionCandidate) {
        return toTitleCase(sectionCandidate);
    }

    return undefined;
}

function buildLlmReadyPayload(
    result: PdfTextLayoutResult
): LlmReadyExtractionPayload {
    const pages = Array.isArray(result.pages) ? result.pages : [];
    const normalizedPages = pages.map((page, index) => ({
        pageNumber: page.pageNumber ?? index + 1,
        normalizedText: normalizeForLlm(page.fullText ?? ''),
    }));

    const fullSourceFormText = normalizedPages
        .filter((page) => page.normalizedText.length > 0)
        .map((page) => `[PAGE ${page.pageNumber}]\n${page.normalizedText}`)
        .join('\n\n');
    const sourceFormText =
        fullSourceFormText.length > MAX_SOURCE_FORM_TEXT_CHARS
            ? `${fullSourceFormText.slice(
                  0,
                  MAX_SOURCE_FORM_TEXT_CHARS
              )}\n\n[TRUNCATED_FOR_MODEL]`
            : fullSourceFormText;

    const allLines = sourceFormText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const repeatedLabels = collectRepeatedShortLabels(allLines);
    const repeatedLabelSet = new Set(
        repeatedLabels.map((entry) => entry.label)
    );
    const inferredSections = inferCandidateSectionHeaders(
        allLines,
        repeatedLabelSet
    );
    const inferredStructuredGroups = inferStructuredGroups(
        allLines,
        repeatedLabels
    );
    const inferredFormName = inferFormNameFromLines(allLines, inferredSections);

    return {
        transactionContext: 'Carrier paper-form transaction extraction',
        inferredFormName,
        sourceFormText,
        sourceFormTextByPage: normalizedPages,
        inferredSections,
        inferredRepeatedGroups:
            repeatedLabels.length > 0
                ? [
                      {
                          key: 'repeatableEntityCandidate',
                          rationale:
                              'Short labels repeated multiple times can indicate repeatable entities (arrays/groups).',
                          repeatedLabels,
                      },
                  ]
                : [],
        inferredStructuredGroups,
        inferredConstraints: inferConstraints(sourceFormText),
        inferredSignals: {
            hasSignatureLanguage: /\bsignature\b/i.test(sourceFormText),
            hasDateLanguage: /\bdate\b/i.test(sourceFormText),
            hasAddressLanguage: /\baddress\b/i.test(sourceFormText),
            hasPhoneLanguage: /\b(phone|telephone)\b/i.test(sourceFormText),
            hasIdentifierLanguage:
                /\b(ssn|social security|tax id|tax identifier|tin)\b/i.test(
                    sourceFormText
                ),
            hasPercentageLanguage: /\b(percentage|percent|%)\b/i.test(
                sourceFormText
            ),
            hasOptionalClauses: /\boptional\b/i.test(sourceFormText),
            hasCheckboxLikeLanguage:
                /\bcheck\b/i.test(sourceFormText) ||
                /\bq\b/.test(sourceFormText),
        },
        extractionMeta: {
            mode: result.mode ?? 'unknown',
            itemsMode: result.itemsMode ?? 'unknown',
            pageCount: result.pageCount ?? pages.length,
            pagesProcessed: result.pagesProcessed ?? pages.length,
            warnings: Array.isArray(result.warnings) ? result.warnings : [],
            truncatedForModel:
                fullSourceFormText.length > MAX_SOURCE_FORM_TEXT_CHARS,
        },
    };
}

function safeJsonParse<T>(value: string, fallback: T): T {
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function defaultCanonicalModel(transactionHint?: string): CanonicalModel {
    return {
        transactionKeySuggestion: transactionHint
            ? transactionHint.toUpperCase().replace(/\s+/g, '_')
            : 'NEW_TRANSACTION',
        transactionName: transactionHint || 'New Transaction',
        archetype: 'unknown',
        summary: 'Canonical model inference fallback',
        sections: [],
        repeatableEntities: [],
        globalConstraints: [],
        requiredArtifacts: {
            hasReviewGate: true,
            hasSignatureBlock: false,
            hasSummaryIntent: true,
            hasNigoPotential: false,
        },
    };
}

function toMachineKey(value: string, fallback = 'field'): string {
    const normalized = toSnakeCase(value);
    return normalized || fallback;
}

function singularizeKey(value: string): string {
    if (value.endsWith('ies')) {
        return `${value.slice(0, -3)}y`;
    }
    if (value.endsWith('sses')) {
        return value.slice(0, -2);
    }
    if (value.endsWith('ss')) {
        return value;
    }
    if (value.endsWith('ses')) {
        return value.slice(0, -2);
    }
    if (value.endsWith('s') && value.length > 1) {
        return value.slice(0, -1);
    }
    return value;
}

function pluralizeKey(value: string): string {
    if (value.endsWith('y') && !/[aeiou]y$/.test(value)) {
        return `${value.slice(0, -1)}ies`;
    }
    if (value.endsWith('s')) {
        return `${value}es`;
    }
    return `${value}s`;
}

function toTitleFromMachineKey(machineKey: string): string {
    return toTitleCase(machineKey.replace(/_/g, ' '));
}

function singularizeLabel(label: string): string {
    return toTitleFromMachineKey(singularizeKey(toMachineKey(label || 'item')));
}

function pluralizeLabel(label: string): string {
    return toTitleFromMachineKey(
        pluralizeKey(singularizeKey(toMachineKey(label || 'item')))
    );
}

function normalizeCanonicalFieldType(
    rawType: string | undefined,
    fieldKey: string
): CanonicalField['type'] {
    const normalized = toMachineKey(rawType ?? '');
    if (normalized === 'string') return 'string';
    if (normalized === 'number') return 'number';
    if (normalized === 'integer') return 'integer';
    if (normalized === 'boolean') return 'boolean';
    if (normalized === 'date') return 'date';
    if (normalized === 'email') return 'email';
    if (normalized === 'phone') return 'phone';
    if (normalized === 'ssn') return 'ssn';
    if (normalized === 'select') return 'select';
    if (normalized === 'array') return 'array';
    if (normalized === 'object') return 'object';
    return inferCanonicalTypeFromFieldKey(fieldKey);
}

function dedupeSimilarFieldKeys(fieldKeys: string[]): string[] {
    const stopWords = new Set([
        'or',
        'and',
        'of',
        'the',
        'a',
        'an',
        'to',
        'for',
    ]);
    const sorted = Array.from(
        new Set(fieldKeys.map((key) => toMachineKey(key)).filter(Boolean))
    ).sort((a, b) => a.length - b.length);

    const kept: Array<{ key: string; tokens: Set<string> }> = [];
    for (const key of sorted) {
        const tokens = new Set(
            key
                .split('_')
                .filter(Boolean)
                .filter((token) => !stopWords.has(token))
        );
        const duplicate = kept.some((entry) => {
            const union = new Set(
                Array.from(entry.tokens).concat(Array.from(tokens))
            );
            if (union.size === 0) return false;
            let overlap = 0;
            for (const token of Array.from(tokens)) {
                if (entry.tokens.has(token)) overlap += 1;
            }
            const similarity = overlap / union.size;
            return similarity >= 0.75;
        });
        if (!duplicate) {
            kept.push({ key, tokens });
        }
    }

    return kept.map((entry) => entry.key);
}

function normalizeCanonicalModel(raw: CanonicalModel): CanonicalModel {
    const sections = Array.isArray(raw.sections)
        ? raw.sections.map((section, sectionIdx) => {
              const sectionId = toMachineKey(
                  section?.id || `section_${sectionIdx + 1}`
              );
              const fields = Array.isArray(section?.fields)
                  ? section.fields
                        .filter((field): field is CanonicalField =>
                            isRecord(field)
                        )
                        .map((field, fieldIdx) => ({
                            key: toMachineKey(
                                typeof field.key === 'string'
                                    ? field.key
                                    : `field_${fieldIdx + 1}`
                            ),
                            label:
                                typeof field.label === 'string' &&
                                field.label.trim()
                                    ? field.label.trim()
                                    : humanizeFieldKey(
                                          typeof field.key === 'string'
                                              ? field.key
                                              : `field_${fieldIdx + 1}`
                                      ),
                            type: normalizeCanonicalFieldType(
                                typeof field.type === 'string'
                                    ? field.type
                                    : undefined,
                                typeof field.key === 'string'
                                    ? field.key
                                    : `field_${fieldIdx + 1}`
                            ),
                            required: Boolean(field.required),
                            description:
                                typeof field.description === 'string'
                                    ? field.description
                                    : undefined,
                            constraints: Array.isArray(field.constraints)
                                ? field.constraints.filter(
                                      (entry): entry is string =>
                                          typeof entry === 'string' &&
                                          entry.trim().length > 0
                                  )
                                : [],
                            options: Array.isArray(field.options)
                                ? field.options
                                      .filter((option) => isRecord(option))
                                      .map((option) => ({
                                          value:
                                              typeof option.value === 'string'
                                                  ? option.value
                                                  : '',
                                          label:
                                              typeof option.label === 'string'
                                                  ? option.label
                                                  : typeof option.value ===
                                                    'string'
                                                  ? option.value
                                                  : '',
                                      }))
                                      .filter(
                                          (option) =>
                                              option.value.trim().length > 0
                                      )
                                : undefined,
                        }))
                  : [];

              return {
                  id: sectionId,
                  title:
                      typeof section?.title === 'string' && section.title.trim()
                          ? section.title.trim()
                          : toTitleCase(sectionId.replace(/_/g, ' ')),
                  sourceAnchors: Array.isArray(section?.sourceAnchors)
                      ? section.sourceAnchors.filter(
                            (anchor): anchor is string =>
                                typeof anchor === 'string'
                        )
                      : [],
                  fields,
              };
          })
        : [];

    const repeatableEntities = Array.isArray(raw.repeatableEntities)
        ? raw.repeatableEntities
              .filter((entity) => isRecord(entity))
              .map((entity, idx) => {
                  const key = toMachineKey(
                      typeof entity.key === 'string'
                          ? entity.key
                          : `group_${idx + 1}`
                  );
                  const rowFieldsRaw = Array.isArray(entity.rowFields)
                      ? entity.rowFields
                      : Array.isArray(entity.fields)
                      ? entity.fields
                      : [];
                  const rowFields = dedupeSimilarFieldKeys(
                      rowFieldsRaw.filter(
                          (field): field is string => typeof field === 'string'
                      )
                  );
                  const fields =
                      rowFields.length > 0
                          ? rowFields
                          : dedupeSimilarFieldKeys(
                                (Array.isArray(entity.fields)
                                    ? entity.fields
                                    : []
                                ).filter(
                                    (field): field is string =>
                                        typeof field === 'string'
                                )
                            );

                  const variants = Array.isArray(entity.variants)
                      ? entity.variants
                            .filter((variant) => isRecord(variant))
                            .map((variant, variantIdx) => {
                                const variantKey = toMachineKey(
                                    typeof variant.key === 'string'
                                        ? variant.key
                                        : typeof variant.title === 'string'
                                        ? variant.title
                                        : `variant_${variantIdx + 1}`
                                );
                                return {
                                    key: variantKey,
                                    title:
                                        typeof variant.title === 'string' &&
                                        variant.title.trim()
                                            ? variant.title.trim()
                                            : toTitleCase(
                                                  variantKey.replace(/_/g, ' ')
                                              ),
                                    anchor:
                                        typeof variant.anchor === 'string'
                                            ? variant.anchor
                                            : undefined,
                                };
                            })
                      : [];

                  return {
                      key: singularizeKey(key),
                      title:
                          typeof entity.title === 'string' &&
                          entity.title.trim()
                              ? entity.title.trim()
                              : toTitleCase(
                                    singularizeKey(key).replace(/_/g, ' ')
                                ),
                      minItems:
                          typeof entity.minItems === 'number' &&
                          Number.isFinite(entity.minItems)
                              ? entity.minItems
                              : undefined,
                      maxItems:
                          typeof entity.maxItems === 'number' &&
                          Number.isFinite(entity.maxItems)
                              ? entity.maxItems
                              : undefined,
                      fields,
                      rowFields: fields,
                      variants,
                  };
              })
        : [];

    return {
        transactionKeySuggestion: toMachineKey(
            raw.transactionKeySuggestion || 'new_transaction'
        ).toUpperCase(),
        transactionName:
            typeof raw.transactionName === 'string' &&
            raw.transactionName.trim()
                ? raw.transactionName.trim()
                : 'New Transaction',
        archetype: raw.archetype ?? 'unknown',
        summary:
            typeof raw.summary === 'string' && raw.summary.trim()
                ? raw.summary.trim()
                : 'Canonical model generated from extracted form content.',
        sections,
        repeatableEntities,
        globalConstraints: Array.isArray(raw.globalConstraints)
            ? raw.globalConstraints.filter(
                  (entry): entry is string =>
                      typeof entry === 'string' && entry.trim().length > 0
              )
            : [],
        requiredArtifacts: {
            hasReviewGate: Boolean(raw.requiredArtifacts?.hasReviewGate),
            hasSignatureBlock: Boolean(
                raw.requiredArtifacts?.hasSignatureBlock
            ),
            hasSummaryIntent:
                raw.requiredArtifacts?.hasSummaryIntent == null
                    ? true
                    : Boolean(raw.requiredArtifacts?.hasSummaryIntent),
            hasNigoPotential: Boolean(raw.requiredArtifacts?.hasNigoPotential),
        },
    };
}

function enrichCanonicalRepeatablesFromExtraction(
    canonicalModel: CanonicalModel,
    llmReadyPayload: LlmReadyExtractionPayload
): CanonicalModel {
    if (!Array.isArray(llmReadyPayload.inferredStructuredGroups)) {
        return canonicalModel;
    }

    const fieldsByKey = canonicalFieldsByKey(canonicalModel);
    const normalizedEntities = [...canonicalModel.repeatableEntities];
    const entityByKey = new Map<string, number>();
    normalizedEntities.forEach((entity, idx) => {
        entityByKey.set(singularizeKey(toMachineKey(entity.key)), idx);
    });

    for (const group of llmReadyPayload.inferredStructuredGroups) {
        const groupKey = singularizeKey(
            toMachineKey(group.key || group.title || 'group')
        );
        const groupRowFieldKeys = Array.from(
            new Set(
                (Array.isArray(group.rowFieldLabels)
                    ? group.rowFieldLabels
                    : []
                )
                    .map((label) => toMachineKey(label))
                    .filter(Boolean)
            )
        );
        const rowFields = dedupeSimilarFieldKeys(
            groupRowFieldKeys
                .map((fieldKey) => {
                    if (fieldsByKey.has(fieldKey)) return fieldKey;
                    const byLabel = Array.from(fieldsByKey.values()).find(
                        (field) =>
                            toMachineKey(field.label) === fieldKey ||
                            toMachineKey(field.key) === fieldKey
                    );
                    if (byLabel?.key) {
                        return byLabel.key;
                    }

                    const tokens = new Set(fieldKey.split('_').filter(Boolean));
                    let bestKey: string | undefined;
                    let bestScore = 0;
                    for (const field of Array.from(fieldsByKey.values())) {
                        const candidateTokens = new Set(
                            `${field.key}_${field.label}`
                                .toLowerCase()
                                .replace(/[^a-z0-9_]+/g, '_')
                                .split('_')
                                .filter(Boolean)
                        );
                        let score = 0;
                        for (const token of Array.from(tokens)) {
                            if (candidateTokens.has(token)) {
                                score += 1;
                            }
                        }
                        if (score > bestScore) {
                            bestScore = score;
                            bestKey = field.key;
                        }
                    }

                    if (bestKey && bestScore >= 2) {
                        return bestKey;
                    }

                    return fieldKey;
                })
                .filter(Boolean)
        );

        const variants = Array.isArray(group.variants)
            ? group.variants.map((variant) => ({
                  key: toMachineKey(variant.key || variant.title || 'variant'),
                  title: variant.title || toTitleCase(variant.key || 'Variant'),
                  anchor: variant.anchor,
              }))
            : [];

        let existingIdx = entityByKey.get(groupKey);
        if (existingIdx == null) {
            const groupStem = groupKey.replace(
                /_(class|group|section|details?)$/,
                ''
            );
            existingIdx = normalizedEntities.findIndex((entity) => {
                const entityKey = singularizeKey(
                    toMachineKey(entity.key || entity.title || 'group')
                );
                const entityStem = entityKey.replace(
                    /_(class|group|section|details?)$/,
                    ''
                );
                const stemMatch =
                    entityStem === groupStem ||
                    entityStem.includes(groupStem) ||
                    groupStem.includes(entityStem);
                if (stemMatch) return true;

                const existingFields = new Set(
                    (entity.rowFields ?? entity.fields ?? []).map((field) =>
                        toMachineKey(field)
                    )
                );
                const overlap = rowFields.filter((field) =>
                    existingFields.has(toMachineKey(field))
                ).length;
                return overlap >= 2;
            });
            if (existingIdx < 0) {
                existingIdx = undefined;
            }
        }

        if (existingIdx == null) {
            normalizedEntities.push({
                key: groupKey,
                title: group.title || toTitleCase(groupKey.replace(/_/g, ' ')),
                minItems: 0,
                maxItems: undefined,
                fields: rowFields,
                rowFields,
                variants,
            });
            entityByKey.set(groupKey, normalizedEntities.length - 1);
            continue;
        }

        const existing = normalizedEntities[existingIdx];
        const mergedRowFields = dedupeSimilarFieldKeys([
            ...(existing.rowFields ?? existing.fields ?? []),
            ...rowFields,
        ]);
        const existingVariants = Array.isArray(existing.variants)
            ? existing.variants
            : [];
        const mergedVariants = Array.from(
            new Map(
                [...existingVariants, ...variants].map((variant) => [
                    toMachineKey(variant.key || variant.title || ''),
                    variant,
                ])
            ).values()
        ).filter(
            (variant) =>
                toMachineKey(variant.key || variant.title || '').length > 0
        );

        normalizedEntities[existingIdx] = {
            ...existing,
            rowFields: mergedRowFields,
            fields: mergedRowFields,
            variants: mergedVariants,
        };
    }

    const dedupedEntities = new Map<
        string,
        CanonicalModel['repeatableEntities'][number]
    >();
    for (const entity of normalizedEntities) {
        const dedupeKey = singularizeKey(
            toMachineKey(entity.key || entity.title || 'group')
        );
        if (!dedupedEntities.has(dedupeKey)) {
            dedupedEntities.set(dedupeKey, entity);
            continue;
        }
        const existing = dedupedEntities.get(dedupeKey)!;
        const mergedRowFields = dedupeSimilarFieldKeys([
            ...(existing.rowFields ?? existing.fields ?? []),
            ...(entity.rowFields ?? entity.fields ?? []),
        ]);
        const mergedVariants = Array.from(
            new Map(
                [...(existing.variants ?? []), ...(entity.variants ?? [])].map(
                    (variant) => [
                        toMachineKey(variant.key || variant.title || ''),
                        variant,
                    ]
                )
            ).values()
        ).filter(
            (variant) =>
                toMachineKey(variant.key || variant.title || '').length > 0
        );

        dedupedEntities.set(dedupeKey, {
            ...existing,
            rowFields: mergedRowFields,
            fields: mergedRowFields,
            variants: mergedVariants,
            minItems:
                existing.minItems != null ? existing.minItems : entity.minItems,
            maxItems:
                existing.maxItems != null ? existing.maxItems : entity.maxItems,
        });
    }

    return {
        ...canonicalModel,
        repeatableEntities: Array.from(dedupedEntities.values()),
    };
}

function enrichCanonicalRepeatablesFromFieldPrefixes(
    canonicalModel: CanonicalModel
): CanonicalModel {
    if (canonicalModel.repeatableEntities.length > 0) {
        return canonicalModel;
    }

    const variantPrefixes = new Set([
        'new',
        'current',
        'existing',
        'primary',
        'contingent',
        'secondary',
        'joint',
        'alternate',
        'additional',
        'proposed',
        'former',
    ]);
    const looksNonRowSuffix = (suffix: string) =>
        /^(signature|signed|date_signed|signature_date|witness|acknowledgement)/.test(
            suffix
        );
    const looksPartySignalSuffix = (suffix: string) =>
        /(name|address|city|state|zip|phone|email|ssn|tax|birth|dob|gender|relationship|citizen|country|party_type|identification)/.test(
            suffix
        );

    type PrefixAgg = {
        prefix: string;
        prefixTokens: string[];
        rowFieldKeys: Set<string>;
        suffixes: Set<string>;
        signalSuffixes: Set<string>;
        nonRowNoiseCount: number;
    };

    const grouped = new Map<string, PrefixAgg>();
    const allFields = canonicalModel.sections.flatMap(
        (section) => section.fields
    );
    for (const field of allFields) {
        const machineKey = toMachineKey(field.key);
        const tokens = machineKey.split('_').filter(Boolean);
        if (tokens.length < 2) continue;

        const maxPrefixLen = Math.min(3, tokens.length - 1);
        for (let prefixLen = maxPrefixLen; prefixLen >= 1; prefixLen -= 1) {
            const prefixTokens = tokens.slice(0, prefixLen);
            const suffixTokens = tokens.slice(prefixLen);
            if (suffixTokens.length === 0) continue;

            const prefix = prefixTokens.join('_');
            const suffix = suffixTokens.join('_');
            const agg = grouped.get(prefix) ?? {
                prefix,
                prefixTokens,
                rowFieldKeys: new Set<string>(),
                suffixes: new Set<string>(),
                signalSuffixes: new Set<string>(),
                nonRowNoiseCount: 0,
            };

            agg.rowFieldKeys.add(field.key);
            agg.suffixes.add(suffix);
            if (looksPartySignalSuffix(suffix)) {
                agg.signalSuffixes.add(suffix);
            }
            if (looksNonRowSuffix(suffix)) {
                agg.nonRowNoiseCount += 1;
            }
            grouped.set(prefix, agg);
        }
    }

    if (grouped.size === 0) {
        return canonicalModel;
    }

    const candidates = Array.from(grouped.values())
        .filter((group) => group.rowFieldKeys.size >= 4)
        .filter((group) => group.suffixes.size >= 4)
        .filter((group) => group.signalSuffixes.size >= 2)
        .filter(
            (group) =>
                !(
                    group.prefixTokens.length === 1 &&
                    variantPrefixes.has(group.prefixTokens[0])
                )
        )
        .sort((a, b) => {
            if (b.prefixTokens.length !== a.prefixTokens.length) {
                return b.prefixTokens.length - a.prefixTokens.length;
            }
            if (b.signalSuffixes.size !== a.signalSuffixes.size) {
                return b.signalSuffixes.size - a.signalSuffixes.size;
            }
            return b.rowFieldKeys.size - a.rowFieldKeys.size;
        });

    const selected: PrefixAgg[] = [];
    const coveredFieldKeys = new Set<string>();
    for (const candidate of candidates) {
        const candidateFields = Array.from(candidate.rowFieldKeys);
        const overlapCount = candidateFields.filter((key) =>
            coveredFieldKeys.has(key)
        ).length;
        const overlapRate =
            candidateFields.length > 0
                ? overlapCount / candidateFields.length
                : 0;
        if (overlapRate > 0.8) continue;

        selected.push(candidate);
        for (const key of candidateFields) {
            coveredFieldKeys.add(key);
        }
        if (selected.length >= 6) break;
    }

    const synthesized = selected
        .map((group) => {
            const rowFields = dedupeSimilarFieldKeys(
                Array.from(
                    new Set(
                        Array.from(group.rowFieldKeys).map((entry) =>
                            toMachineKey(entry)
                        )
                    )
                )
            );
            const firstToken = group.prefixTokens[0] ?? '';
            return {
                key: group.prefix,
                title: toTitleCase(group.prefix.replace(/_/g, ' ')),
                fields: rowFields,
                rowFields,
                minItems:
                    firstToken === 'new' || firstToken === 'primary'
                        ? 1
                        : undefined,
                maxItems: undefined,
                rationale:
                    'Synthesized repeatable group from canonical key prefix clustering when explicit repeatableEntities were missing.',
            };
        })
        .filter((group) => (group.rowFields?.length ?? 0) >= 4);

    if (synthesized.length === 0) {
        return canonicalModel;
    }

    return {
        ...canonicalModel,
        repeatableEntities: synthesized,
    };
}

function shouldRetryCanonicalModel(
    canonicalModel: CanonicalModel,
    llmReadyPayload: LlmReadyExtractionPayload
): boolean {
    const hasStructuredGroups =
        llmReadyPayload.inferredStructuredGroups.length > 0;
    if (!hasStructuredGroups) {
        return false;
    }

    const hasRepeatables = canonicalModel.repeatableEntities.length > 0;
    if (!hasRepeatables) {
        return true;
    }

    return canonicalModel.repeatableEntities.some((entity) => {
        const hasFields = (entity.rowFields ?? entity.fields ?? []).length > 0;
        const hasVariants =
            Array.isArray(entity.variants) && entity.variants.length > 0;
        return !hasFields || !hasVariants;
    });
}

function defaultTabInference(
    archetype: CanonicalModel['archetype'] = 'unknown'
): TabInference {
    return {
        archetype,
        tabSchemas: [
            {
                id: 'review_form_data',
                title: 'Review Form Data',
                purpose: 'Review extracted form details before entry',
                sectionRefs: [],
                fieldRefs: [],
                required: true,
            },
            {
                id: 'details',
                title: 'Details',
                purpose: 'Collect core transaction details',
                sectionRefs: [],
                fieldRefs: [],
                required: true,
            },
            {
                id: 'summary',
                title: 'Summary',
                purpose: 'Review all captured data',
                sectionRefs: [],
                fieldRefs: [],
                required: true,
            },
            {
                id: 'confirm',
                title: 'Confirm',
                purpose: 'Final confirmation and submit',
                sectionRefs: [],
                fieldRefs: [],
                required: true,
            },
        ],
        gatingRules: {
            includeReviewGate: true,
            includeNigoSummary: false,
            includeSignature: false,
            includeSummary: true,
        },
        notes: ['Fallback tab inference used due to LLM parse issue.'],
    };
}

function canonicalTypeToJsonType(
    type: string
): 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' {
    if (type === 'number') return 'number';
    if (type === 'integer') return 'integer';
    if (type === 'boolean') return 'boolean';
    if (type === 'array') return 'array';
    if (type === 'object') return 'object';
    return 'string';
}

function canonicalTypeToWidget(type: string): string {
    if (type === 'date') return 'DateWidgetV2';
    if (type === 'phone') return 'NumbersWidget';
    if (type === 'number' || type === 'integer') return 'NumbersWidget';
    if (type === 'boolean') return 'CheckboxWidget';
    if (type === 'select') return 'SelectWidget';
    if (type === 'email') return 'EmailWidget';
    return 'TextWidget';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeKey(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ');
}

function normalizeMiddleTitleSeed(value: string): string {
    return value
        .replace(/\s+/g, ' ')
        .replace(/^use this form to\s+/i, '')
        .replace(/\bplease note\b.*$/i, '')
        .replace(/\bbefore completing\b.*$/i, '')
        .replace(/\bplease print clearly\b.*$/i, '')
        .replace(/\bon your contract\(s\)\b/gi, '')
        .replace(/\bon your contracts\b/gi, '')
        .replace(/\btransaction form\b/gi, 'transaction')
        .replace(/[:;,.]+$/g, '')
        .trim();
}

function toDetailsTitle(value: string): string | undefined {
    const normalized = normalizeMiddleTitleSeed(value)
        .replace(/\b(change|form|request|transaction)\b/gi, ' ')
        .replace(/\b(of|for|to)\b$/i, '')
        .replace(/^(an|a|the|of)\s+/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    if (!normalized) return undefined;
    return `${toTitleCase(normalized)} Details`;
}

function deriveDynamicMiddleTitle(
    canonicalModel: CanonicalModel,
    pdfFormName?: string
): string {
    const formName = pdfFormName?.trim() ?? '';
    const canonicalName = canonicalModel.transactionName?.trim() ?? '';

    const detailsFromCanonical = canonicalName
        ? toDetailsTitle(canonicalName)
        : undefined;
    if (detailsFromCanonical) {
        return detailsFromCanonical;
    }

    const detailsFromForm = formName ? toDetailsTitle(formName) : undefined;
    if (detailsFromForm) {
        return detailsFromForm;
    }

    const cleanedFormName = formName ? normalizeMiddleTitleSeed(formName) : '';
    if (cleanedFormName.length > 0 && cleanedFormName.length <= 64) {
        return cleanedFormName;
    }

    return 'Transaction Details';
}

function isFixedArchetype(archetype: CanonicalModel['archetype']): boolean {
    return (
        archetype === 'party_change_complex' ||
        archetype === 'party_change_standard' ||
        archetype === 'non_financial_micro'
    );
}

function fieldLooksOwnerScoped(field: CanonicalField): boolean {
    const text = `${field.key} ${field.label}`.toLowerCase();
    return (
        text.includes('owner') ||
        text.includes('contract') ||
        text.includes('policy') ||
        text.includes('insured') ||
        text.includes('annuitant')
    );
}

function canonicalFieldsByKey(
    canonicalModel: CanonicalModel
): Map<string, CanonicalField> {
    const out = new Map<string, CanonicalField>();
    for (const section of canonicalModel.sections) {
        for (const field of section.fields) {
            out.set(field.key, field);
        }
    }
    return out;
}

function pickOwnerFieldRefs(canonicalModel: CanonicalModel): string[] {
    const allFields = canonicalModel.sections.flatMap(
        (section) => section.fields
    );
    const ownerLike = allFields
        .filter(fieldLooksOwnerScoped)
        .map((field) => field.key);
    if (ownerLike.length > 0) {
        return Array.from(new Set(ownerLike)).slice(0, 24);
    }
    return allFields.slice(0, 12).map((field) => field.key);
}

function isReservedFixedField(fieldKey: string): boolean {
    const key = fieldKey.trim().toLowerCase();
    return (
        key === 'summary' ||
        key === 'validationurl' ||
        key === 'signaturedata' ||
        key === 'confirmready'
    );
}

function isSignatureField(field: CanonicalField): boolean {
    const keyLower = field.key.toLowerCase();
    const labelLower = field.label.toLowerCase();
    const combined = `${keyLower} ${labelLower}`;

    // Exclude fields that are part of party information (these belong in party entities, not signature tab)
    const isPartyField =
        /new_owner_|current_owner_|new_beneficiary_|primary_beneficiary_|contingent_beneficiary_|new_annuitant_|current_annuitant_/.test(
            keyLower
        );
    if (isPartyField) {
        return false;
    }

    // Exclude fields that are clearly about other things despite containing "signature"
    const isNonSignatureField =
        /tax.*certification|taxpayer.*certification/i.test(combined) ||
        /irrevocable.*beneficiary/i.test(combined) ||
        /consultation/i.test(combined);
    if (isNonSignatureField) {
        return false;
    }

    // Check for actual signature-related patterns
    return (
        /\bowner.*signature\b/i.test(combined) ||
        /\bsignature.*owner\b/i.test(combined) ||
        /\bsignature.*date\b/i.test(combined) ||
        /\bdate.*signed\b/i.test(combined) ||
        /\bsigned.*date\b/i.test(combined) ||
        /city.*state.*sign|where.*sign/i.test(combined) ||
        /\bwitness.*signature\b/i.test(combined) ||
        /\backnowledgement\b/i.test(combined) ||
        /\bnotary\b/i.test(combined) ||
        (/\bsignature\b/i.test(combined) &&
            !/of\s+(irrevocable|beneficiary|party)/i.test(combined))
    );
}

function pickSignatureFieldRefs(canonicalModel: CanonicalModel): string[] {
    const allFields = canonicalModel.sections.flatMap(
        (section) => section.fields
    );
    return allFields
        .filter((field) => isSignatureField(field))
        .map((field) => field.key)
        .slice(0, 12);
}

type RepeatableArrayDescriptor = {
    arrayFieldKey: string;
    title: string;
    rowFieldKeys: string[];
    minItems?: number;
    maxItems?: number;
    requiredByDefault: boolean;
    aliases: string[];
};

function buildRepeatableArrayDescriptors(
    canonicalModel: CanonicalModel
): RepeatableArrayDescriptor[] {
    const out: RepeatableArrayDescriptor[] = [];
    const dedupe = new Set<string>();

    for (const entity of canonicalModel.repeatableEntities) {
        const entityKey = singularizeKey(
            toMachineKey(entity.key || entity.title || 'item')
        );
        const pluralKey = pluralizeKey(entityKey);
        const rowFieldKeys = Array.from(
            new Set(
                (entity.rowFields ?? entity.fields ?? [])
                    .map((field) => toMachineKey(field))
                    .filter(Boolean)
            )
        );
        if (rowFieldKeys.length === 0) continue;

        const variants =
            Array.isArray(entity.variants) && entity.variants.length > 0
                ? entity.variants
                : [{ key: '', title: '' }];

        for (const variant of variants) {
            const variantSeed = `${variant.key || variant.title || ''}`.trim();
            const variantKey = variantSeed ? toMachineKey(variantSeed, '') : '';
            const arrayFieldKey = variantKey
                ? `${variantKey}_${pluralKey}`
                : pluralKey;
            if (!arrayFieldKey || dedupe.has(arrayFieldKey)) continue;
            dedupe.add(arrayFieldKey);

            const baseTitleSeed =
                entity.title?.trim() ||
                toTitleCase(entityKey.replace(/_/g, ' '));
            const baseTitle = pluralizeLabel(baseTitleSeed);
            const variantTitle =
                variant.title?.trim() || toTitleCase(variantKey);
            const variantContainsBase =
                variantKey.length > 0 &&
                singularizeKey(toMachineKey(variantTitle)).includes(
                    singularizeKey(toMachineKey(baseTitleSeed))
                );
            const title = variantKey
                ? variantContainsBase
                    ? pluralizeLabel(variantTitle)
                    : `${variantTitle} ${baseTitle}`.trim()
                : baseTitle;

            const aliases = Array.from(
                new Set(
                    (variantKey
                        ? [arrayFieldKey, `${variantKey}_${entityKey}`]
                        : [
                              arrayFieldKey,
                              pluralKey,
                              entityKey,
                              entity.key,
                              entity.title,
                          ]
                    )
                        .map((entry) => toMachineKey(entry))
                        .filter(Boolean)
                )
            );

            out.push({
                arrayFieldKey,
                title,
                rowFieldKeys,
                minItems:
                    typeof entity.minItems === 'number' &&
                    Number.isFinite(entity.minItems)
                        ? entity.minItems
                        : undefined,
                maxItems:
                    typeof entity.maxItems === 'number' &&
                    Number.isFinite(entity.maxItems)
                        ? entity.maxItems
                        : undefined,
                requiredByDefault:
                    variantKey === 'primary' || (entity.minItems ?? 0) > 0,
                aliases,
            });
        }
    }

    return out;
}

function mapRepeatableDescriptorByFieldRef(
    canonicalModel: CanonicalModel
): Map<string, RepeatableArrayDescriptor> {
    const descriptors = buildRepeatableArrayDescriptors(canonicalModel);
    const map = new Map<string, RepeatableArrayDescriptor>();
    for (const descriptor of descriptors) {
        for (const alias of descriptor.aliases) {
            if (!alias || map.has(alias)) continue;
            map.set(alias, descriptor);
        }
    }
    return map;
}

function pickDynamicFieldRefsFromCanonical(
    canonicalModel: CanonicalModel,
    ownerFieldRefs: string[],
    signatureFieldRefs: string[]
): string[] {
    const ownerSet = new Set(ownerFieldRefs);
    const signatureSet = new Set(signatureFieldRefs);
    const repeatableDescriptors =
        buildRepeatableArrayDescriptors(canonicalModel);
    const repeatableFieldRefs = repeatableDescriptors.map(
        (descriptor) => descriptor.arrayFieldKey
    );
    const repeatableRowFieldSet = new Set(
        repeatableDescriptors.flatMap((descriptor) => descriptor.rowFieldKeys)
    );
    const repeatableAliasSet = new Set(
        repeatableDescriptors.flatMap((descriptor) =>
            descriptor.aliases.map((alias) => toMachineKey(alias))
        )
    );
    const isSyntheticRepeatableFieldAlias = (fieldKey: string): boolean => {
        const machineKey = toMachineKey(fieldKey);
        if (repeatableAliasSet.has(machineKey)) return true;
        if (machineKey.startsWith('field_')) {
            const unwrapped = machineKey.slice('field_'.length);
            if (repeatableAliasSet.has(unwrapped)) return true;
        }
        return false;
    };
    const candidates = canonicalModel.sections
        .flatMap((section) => section.fields)
        .filter((field) => !ownerSet.has(field.key))
        .filter((field) => !signatureSet.has(field.key))
        .filter((field) => !isReservedFixedField(field.key))
        .filter((field) => !repeatableRowFieldSet.has(toMachineKey(field.key)))
        .filter((field) => !isSyntheticRepeatableFieldAlias(field.key))
        .map((field) => field.key);

    const uniqueCandidates = Array.from(new Set(candidates)).sort((a, b) =>
        toMachineKey(a).localeCompare(toMachineKey(b))
    );

    const merged = Array.from(
        new Set([...repeatableFieldRefs, ...uniqueCandidates])
    );
    if (merged.length > 0) {
        return merged.slice(0, 60);
    }

    const fallback = canonicalModel.sections
        .flatMap((section) => section.fields)
        .filter((field) => !signatureSet.has(field.key))
        .filter((field) => !isReservedFixedField(field.key))
        .filter((field) => !repeatableRowFieldSet.has(toMachineKey(field.key)))
        .filter((field) => !isSyntheticRepeatableFieldAlias(field.key))
        .map((field) => field.key);
    const sortedFallback = Array.from(new Set(fallback)).sort((a, b) =>
        toMachineKey(a).localeCompare(toMachineKey(b))
    );
    return Array.from(
        new Set([...repeatableFieldRefs, ...sortedFallback])
    ).slice(0, 24);
}

function enforceFixedTabSkeleton(
    canonicalModel: CanonicalModel,
    tabInference: TabInference,
    pdfFormName?: string
): TabInference {
    if (!isFixedArchetype(canonicalModel.archetype)) {
        return tabInference;
    }

    const ownerFieldRefs = pickOwnerFieldRefs(canonicalModel);
    const signatureFieldRefs = pickSignatureFieldRefs(canonicalModel);
    const dynamicFieldRefs = pickDynamicFieldRefsFromCanonical(
        canonicalModel,
        ownerFieldRefs,
        signatureFieldRefs
    );
    const dynamicTitle = deriveDynamicMiddleTitle(canonicalModel, pdfFormName);

    return {
        ...tabInference,
        tabSchemas: [
            {
                id: 'owner_details',
                title: 'Owner Details',
                purpose: 'Capture owner and contract details.',
                sectionRefs: [],
                fieldRefs: ownerFieldRefs,
                required: true,
            },
            {
                id: 'transaction_details',
                title: dynamicTitle,
                purpose:
                    'Capture transaction-specific details inferred from uploaded form.',
                sectionRefs: [],
                fieldRefs: dynamicFieldRefs,
                required: true,
            },
            {
                id: 'signature',
                title: 'Signature',
                purpose: 'Capture signature and acknowledgement details.',
                sectionRefs: [],
                fieldRefs:
                    signatureFieldRefs.length > 0
                        ? signatureFieldRefs
                        : ['signatureData'],
                required: true,
            },
            {
                id: 'summary',
                title: 'Summary',
                purpose: 'Review transaction summary and validation details.',
                sectionRefs: [],
                fieldRefs: ['summary', 'validationUrl'],
                required: true,
            },
            {
                id: 'confirm',
                title: 'Confirm',
                purpose: 'Final confirmation before submission.',
                sectionRefs: [],
                fieldRefs: ['confirmReady'],
                required: true,
            },
        ],
        gatingRules: {
            ...tabInference.gatingRules,
            includeSummary: true,
            includeSignature: true,
        },
        notes: [
            ...tabInference.notes,
            'Fixed skeleton applied for party-change/non-financial archetype: Owner Details -> Dynamic Middle -> Signature -> Summary -> Confirm.',
        ],
    };
}

function buildPhase2Context(
    llmReadyPayload: LlmReadyExtractionPayload,
    canonicalModel: CanonicalModel,
    tabInference: TabInference,
    archetypeContextPack: ArchetypeContextPack,
    pdfFormName: string
): Phase2GenerationContext {
    const fixedSkeletonApplied = isFixedArchetype(canonicalModel.archetype);

    return {
        transactionKeySuggestion: canonicalModel.transactionKeySuggestion,
        transactionName: canonicalModel.transactionName,
        pdfFormName,
        archetype: canonicalModel.archetype,
        extractedConstraints: [
            ...llmReadyPayload.inferredConstraints,
            ...canonicalModel.globalConstraints,
        ].slice(0, 30),
        canonicalSections: canonicalModel.sections.map((section) => ({
            id: section.id,
            title: section.title,
            fields: section.fields.map((field) => ({
                key: field.key,
                label: field.label,
                type: field.type,
                required: field.required,
                constraints: field.constraints ?? [],
            })),
        })),
        repeatableEntities: canonicalModel.repeatableEntities.map((entity) => ({
            key: entity.key,
            title: entity.title,
            minItems: entity.minItems,
            maxItems: entity.maxItems,
            rowFields: entity.rowFields ?? entity.fields ?? [],
            variants: Array.isArray(entity.variants)
                ? entity.variants.map((variant) => ({
                      key: variant.key,
                      title: variant.title,
                      anchor: variant.anchor,
                  }))
                : [],
        })),
        tabPlan: tabInference.tabSchemas.map((tab) => ({
            id: tab.id,
            title: tab.title,
            purpose: tab.purpose,
            fieldRefs: tab.fieldRefs,
            sectionRefs: tab.sectionRefs,
        })),
        priorTabHints: archetypeContextPack.tabPriors
            .slice(0, 8)
            .map((tab) => ({
                title: tab.title,
                occurrenceRate: tab.occurrenceRate,
                averageIndex: tab.averageIndex,
                commonFields: tab.commonFields.slice(0, 12),
                widgetHints: tab.widgetHints.slice(0, 8),
                templateHints: tab.templateHints.slice(0, 8),
            })),
        priorGlobalWidgetHints: archetypeContextPack.globalWidgetHints.slice(
            0,
            12
        ),
        priorGlobalTemplateHints:
            archetypeContextPack.globalTemplateHints.slice(0, 12),
        softPriorRules: archetypeContextPack.softPriorRules,
        fixedSkeleton: fixedSkeletonApplied
            ? {
                  applied: true,
                  fixedTitles: [
                      'Owner Details',
                      'Signature',
                      'Summary',
                      'Confirm',
                  ],
                  dynamicMiddleTitle:
                      tabInference.tabSchemas[1]?.title ??
                      'Transaction Details',
              }
            : {
                  applied: false,
                  fixedTitles: [],
                  dynamicMiddleTitle: '',
              },
    };
}

function extractNumberByPattern(
    text: string,
    pattern: RegExp
): number | undefined {
    const match = text.match(pattern);
    if (!match) return undefined;
    const raw = match[1];
    if (!raw) return undefined;
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
}

const FLEX_PHONE_PATTERN =
    '^(?:\\+\\d{1,3}[\\s-]?)?\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}$';

function applyCanonicalValidationHints(
    schemaEntry: Record<string, unknown>,
    canonical: CanonicalField
): void {
    const constraintText = [
        canonical.description ?? '',
        ...(canonical.constraints ?? []),
    ]
        .join(' ')
        .toLowerCase();

    if (canonical.type === 'date' && typeof schemaEntry.format !== 'string') {
        schemaEntry.format = 'date';
    }
    if (canonical.type === 'email' && typeof schemaEntry.format !== 'string') {
        schemaEntry.format = 'email';
    }
    if (canonical.type === 'ssn') {
        if (typeof schemaEntry.pattern !== 'string') {
            schemaEntry.pattern = '^\\d{3}-?\\d{2}-?\\d{4}$';
        }
        if (typeof schemaEntry.maxLength !== 'number') {
            schemaEntry.maxLength = 11;
        }
    }
    if (canonical.type === 'phone') {
        if (typeof schemaEntry.pattern !== 'string') {
            schemaEntry.pattern = FLEX_PHONE_PATTERN;
        }
    }

    if (
        (canonical.type === 'number' || canonical.type === 'integer') &&
        /(percent|percentage|allocation|share of benefits)/i.test(
            constraintText
        )
    ) {
        if (typeof schemaEntry.minimum !== 'number') {
            schemaEntry.minimum = 0;
        }
        if (typeof schemaEntry.maximum !== 'number') {
            schemaEntry.maximum = 100;
        }
    }

    if (canonical.type === 'array' && /\bat least one\b/.test(constraintText)) {
        schemaEntry.minItems = 1;
    }

    if (canonical.type === 'string') {
        const maxLength = extractNumberByPattern(
            constraintText,
            /(?:max(?:imum)?(?: length)?|not to exceed)\s+(\d+(?:\.\d+)?)/i
        );
        if (maxLength != null) {
            if (typeof schemaEntry.maxLength !== 'number') {
                schemaEntry.maxLength = Math.floor(maxLength);
            }
        }

        const keyAndLabel = `${canonical.key} ${canonical.label}`.toLowerCase();
        const looksZipLike = /(zip|postal)[\s_-]*(code)?/.test(keyAndLabel);
        if (looksZipLike) {
            if (typeof schemaEntry.pattern !== 'string') {
                schemaEntry.pattern = '^\\d{5}(?:-\\d{4})?$';
            }
            if (typeof schemaEntry.maxLength !== 'number') {
                schemaEntry.maxLength = 10;
            }
        }
    }

    if (canonical.type === 'number' || canonical.type === 'integer') {
        const max = extractNumberByPattern(
            constraintText,
            /(?:maximum|not to exceed|max)\s+(\d+(?:\.\d+)?)/i
        );
        const min = extractNumberByPattern(
            constraintText,
            /(?:minimum|min(?:imum)?)\s+(\d+(?:\.\d+)?)/i
        );
        if (min != null) {
            if (typeof schemaEntry.minimum !== 'number') {
                schemaEntry.minimum = min;
            }
        }
        if (max != null) {
            if (typeof schemaEntry.maximum !== 'number') {
                schemaEntry.maximum = max;
            }
        }
    }
}

function uiSchemaForCanonicalField(
    canonical: CanonicalField
): Record<string, unknown> {
    if (canonical.type === 'phone') {
        return {
            'ui:widget': 'NumbersWidget',
            isPhone: true,
            errorMessage: 'Please enter valid phone number',
        };
    }
    if (canonical.type === 'ssn') {
        return {
            'ui:widget': 'TextWidget',
            'ui:options': {
                maskOnBlur: true,
                disableCopyPaste: true,
            },
        };
    }
    return { 'ui:widget': canonicalTypeToWidget(canonical.type) };
}

function looksAddressObjectSchema(
    schemaValue: Record<string, unknown>
): boolean {
    if (schemaValue.type !== 'object') {
        return false;
    }
    const properties = isRecord(schemaValue.properties)
        ? schemaValue.properties
        : {};
    const keySet = new Set(
        Object.keys(properties)
            .map((key) => toMachineKey(key))
            .filter(Boolean)
    );
    const addressSignals = [
        'address',
        'address_line_1',
        'addressline1',
        'city',
        'state',
        'zip',
        'zip_code',
        'country',
    ];
    const signalCount = addressSignals.filter((signal) =>
        keySet.has(signal)
    ).length;
    return signalCount >= 3 || (keySet.has('city') && keySet.has('state'));
}

function findSchemaPropertyKeyByMachineKey(
    properties: Record<string, unknown>,
    machineKey: string
): string | undefined {
    for (const key of Object.keys(properties)) {
        if (toMachineKey(key) === machineKey) {
            return key;
        }
    }
    return undefined;
}

function inferArrayTitlePathsFromFieldKeys(fieldKeys: string[]): string[] {
    const byMachineKey = new Map<string, string>();
    for (const key of fieldKeys) {
        const machineKey = toMachineKey(key);
        if (!machineKey || byMachineKey.has(machineKey)) continue;
        byMachineKey.set(machineKey, key);
    }

    const singleFieldCandidates = [
        'full_legal_name',
        'full_name',
        'name',
        'party_name',
        'beneficiary_name',
        'annuitant_name',
        'owner_name',
        'trust_name',
        'organization_name',
        'entity_name',
    ];
    for (const candidate of singleFieldCandidates) {
        const existing = byMachineKey.get(candidate);
        if (existing) {
            return [existing];
        }
    }

    const firstNameCandidates = ['first_name', 'firstname', 'first'];
    const lastNameCandidates = ['last_name', 'lastname', 'surname', 'last'];
    const firstName = firstNameCandidates
        .map((candidate) => byMachineKey.get(candidate))
        .find((value): value is string => typeof value === 'string');
    const lastName = lastNameCandidates
        .map((candidate) => byMachineKey.get(candidate))
        .find((value): value is string => typeof value === 'string');
    if (firstName && lastName) {
        return [firstName, lastName];
    }

    return [];
}

function inferArrayTitlePathsFromItemsSchema(
    arraySchema: Record<string, unknown>
): string[] {
    const items = isRecord(arraySchema.items) ? arraySchema.items : {};
    const itemProperties = isRecord(items.properties) ? items.properties : {};
    const direct = inferArrayTitlePathsFromFieldKeys(
        Object.keys(itemProperties)
    );
    if (direct.length > 0) {
        return direct;
    }

    const partyKey = findSchemaPropertyKeyByMachineKey(itemProperties, 'party');
    const partySchema =
        partyKey && isRecord(itemProperties[partyKey])
            ? itemProperties[partyKey]
            : undefined;
    const partyProperties =
        partySchema && isRecord(partySchema.properties)
            ? partySchema.properties
            : {};
    const nested = inferArrayTitlePathsFromFieldKeys(
        Object.keys(partyProperties)
    );
    if (nested.length > 0) {
        return nested.map((entry) => `party.${entry}`);
    }

    return [];
}

function inferDefaultArrayItemTitle(
    fieldKey: string,
    arraySchema: Record<string, unknown>,
    descriptor?: RepeatableArrayDescriptor
): string {
    if (descriptor?.title) {
        return singularizeLabel(descriptor.title);
    }
    if (
        typeof arraySchema.title === 'string' &&
        arraySchema.title.trim().length > 0
    ) {
        return singularizeLabel(arraySchema.title);
    }
    return singularizeLabel(humanizeFieldKey(fieldKey));
}

function shouldKeepStaticArrayHeader(
    fieldKey: string,
    descriptor?: RepeatableArrayDescriptor
): boolean {
    const text = `${fieldKey} ${descriptor?.arrayFieldKey ?? ''} ${
        descriptor?.title ?? ''
    }`
        .toLowerCase()
        .replace(/_/g, ' ');

    return (
        /primary\s+beneficiar/.test(text) ||
        /contingent\s+beneficiar/.test(text) ||
        /secondary\s+beneficiar/.test(text)
    );
}

function isPartyRepeatableDescriptor(
    descriptor: RepeatableArrayDescriptor
): boolean {
    const text = `${descriptor.arrayFieldKey} ${
        descriptor.title
    } ${descriptor.rowFieldKeys.join(' ')}`
        .toLowerCase()
        .replace(/_/g, ' ');
    const signalMatches = text.match(
        /(name|address|city|state|zip|phone|email|ssn|tax|birth|dob|gender|relationship|citizen|country|party\s*type|identification)/g
    );
    const signalCount = signalMatches ? signalMatches.length : 0;
    return (
        signalCount >= 3 ||
        /(beneficiar|annuitant|assignee|payee|agent|party|owner)/.test(text)
    );
}

function normalizeUiWidget(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function hasSelectOptions(schemaNode: Record<string, unknown>): boolean {
    return (
        (Array.isArray(schemaNode.oneOf) && schemaNode.oneOf.length > 0) ||
        (Array.isArray(schemaNode.anyOf) && schemaNode.anyOf.length > 0) ||
        (Array.isArray(schemaNode.enum) && schemaNode.enum.length > 0)
    );
}

function inferFallbackSelectOptions(
    fieldKey: string,
    schemaNode: Record<string, unknown>
): Array<{ const: string; title: string }> | undefined {
    const text = `${fieldKey} ${schemaNode.title ?? ''}`
        .toLowerCase()
        .replace(/_/g, ' ');
    if (/\bgender\b|\bsex\b/.test(text)) {
        return [
            { const: 'MALE', title: 'Male' },
            { const: 'FEMALE', title: 'Female' },
            { const: 'OTHER', title: 'Other' },
        ];
    }
    return undefined;
}

function repairSelectUiWithoutOptions(
    fieldKey: string,
    schemaNode: Record<string, unknown>,
    uiNode: Record<string, unknown>
): Record<string, unknown> {
    const widget = normalizeUiWidget(uiNode['ui:widget']);
    if (widget !== 'selectwidget' || hasSelectOptions(schemaNode)) {
        return uiNode;
    }

    const fallbackOptions = inferFallbackSelectOptions(fieldKey, schemaNode);
    if (fallbackOptions && fallbackOptions.length > 0) {
        schemaNode.oneOf = fallbackOptions;
        return uiNode;
    }

    return {
        ...uiNode,
        'ui:widget': 'TextWidget',
    };
}

function looksPhoneScalarSchema(schemaValue: Record<string, unknown>): boolean {
    const keySignals = `${schemaValue.title ?? ''} ${
        schemaValue.description ?? ''
    }`
        .toLowerCase()
        .trim();
    const type = schemaValue.type;
    const isScalarType =
        type === 'string' ||
        type === 'number' ||
        type === 'integer' ||
        (Array.isArray(type) &&
            type.some((entry) => entry === 'string' || entry === 'number'));
    return (
        isScalarType &&
        (keySignals.includes('phone') ||
            keySignals.includes('telephone') ||
            keySignals.includes('dial number'))
    );
}

function findPhoneFieldInItemSchema(
    itemProperties: Record<string, unknown>,
    itemUi: Record<string, unknown>
): string | undefined {
    const candidateKeys = Object.keys(itemProperties);
    for (const key of candidateKeys) {
        const machineKey = toMachineKey(key);
        if (!/phone|telephone|dial/.test(machineKey)) continue;
        const schemaValue = itemProperties[key];
        if (!isRecord(schemaValue)) continue;
        if (schemaValue.type === 'array' || schemaValue.type === 'object')
            continue;
        return key;
    }

    for (const key of candidateKeys) {
        const uiNode = isRecord(itemUi[key]) ? itemUi[key] : {};
        const uiWidget = normalizeUiWidget(uiNode['ui:widget']);
        const schemaValue = itemProperties[key];
        if (!isRecord(schemaValue)) continue;
        if (schemaValue.type === 'array' || schemaValue.type === 'object')
            continue;
        if (
            uiWidget === 'numberswidget' ||
            looksPhoneScalarSchema(schemaValue)
        ) {
            return key;
        }
    }

    return undefined;
}

function buildPhoneListSchemaFromScalar(
    phoneScalarSchema: Record<string, unknown>,
    wasRequired: boolean
): Record<string, unknown> {
    const dialPattern =
        typeof phoneScalarSchema.pattern === 'string'
            ? phoneScalarSchema.pattern
            : FLEX_PHONE_PATTERN;
    const phonesSchema: Record<string, unknown> = {
        type: 'array',
        title: 'Phone',
        items: {
            type: 'object',
            default: {
                dialNumber: '',
                phoneType: 'MOBILE',
                isPreferred: false,
            },
            properties: {
                phoneType: {
                    type: 'string',
                    title: 'Phone type',
                    enum: ['MOBILE', 'HOME', 'BUSINESS', 'FAX', 'OTHER'],
                    default: 'MOBILE',
                },
                dialNumber: {
                    type: ['string', 'null'],
                    title: 'Number',
                    pattern: dialPattern,
                },
                isPreferred: {
                    type: 'boolean',
                    title: 'Preferred Phone',
                },
            },
            required: ['dialNumber'],
        },
    };

    if (wasRequired) {
        phonesSchema.minItems = 1;
    }
    const phonesItems = isRecord(phonesSchema.items)
        ? phonesSchema.items
        : null;
    const phonesItemProperties =
        phonesItems && isRecord(phonesItems.properties)
            ? phonesItems.properties
            : null;
    const dialNumberSchema =
        phonesItemProperties && isRecord(phonesItemProperties.dialNumber)
            ? phonesItemProperties.dialNumber
            : null;
    if (dialNumberSchema) {
        dialNumberSchema.pattern = FLEX_PHONE_PATTERN;
    }
    return phonesSchema;
}

function buildPhoneListUiSchema(): Record<string, unknown> {
    return {
        'ui:options': {
            ArrayFieldTemplate: 'PartyInfoListTemplate',
            addable: true,
            orderable: false,
            removable: true,
            addButtonCTA: 'Add Phone',
            label: true,
            title: 'Phone',
            showDeleteBtn: true,
            showAddBtn: true,
            showRemoveItemBtn: true,
            prefferedCTA: 'Preferred Phone',
        },
        items: {
            'ui:options': {
                ObjectFieldTemplate: 'PartyCardFieldTemplate',
                label: false,
                noMargin: true,
                nobackground: true,
            },
            phoneType: {
                'ui:widget': 'RadioWidget',
                'ui:options': {
                    inline: true,
                    enumNames: ['Mobile', 'Home', 'Business', 'Fax', 'Other'],
                },
            },
            dialNumber: {
                'ui:widget': 'NumbersWidget',
                'ui:options': {
                    isPhone: true,
                },
                format: '+### (###) ###-####',
                errorMessage: 'Please enter valid phone number',
            },
        },
    };
}

function transformRepeatableItemPhoneScalarToPhoneList(
    fieldKey: string,
    arraySchema: Record<string, unknown>,
    fieldUi: Record<string, unknown>
): void {
    const items = isRecord(arraySchema.items) ? arraySchema.items : null;
    if (!items) return;
    const itemProperties = isRecord(items.properties) ? items.properties : null;
    if (!itemProperties) return;
    if (findSchemaPropertyKeyByMachineKey(itemProperties, 'phones')) return;

    const itemUi = isRecord(fieldUi.items) ? fieldUi.items : {};
    const phoneFieldKey = findPhoneFieldInItemSchema(itemProperties, itemUi);
    if (!phoneFieldKey) return;

    const phoneScalarSchema = isRecord(itemProperties[phoneFieldKey])
        ? itemProperties[phoneFieldKey]
        : null;
    if (!phoneScalarSchema) return;
    const requiredRaw = Array.isArray(items.required) ? items.required : [];
    const required = requiredRaw.filter(
        (entry): entry is string => typeof entry === 'string'
    );
    const wasRequired = required.includes(phoneFieldKey);
    const phoneListKey = 'phones';

    delete itemProperties[phoneFieldKey];
    if (isRecord(itemUi[phoneFieldKey])) {
        delete itemUi[phoneFieldKey];
    }

    itemProperties[phoneListKey] = buildPhoneListSchemaFromScalar(
        phoneScalarSchema,
        wasRequired
    );

    const nextRequired = required.filter((entry) => entry !== phoneFieldKey);
    if (wasRequired) {
        nextRequired.push(phoneListKey);
    }
    items.required = Array.from(new Set(nextRequired));

    itemUi[phoneListKey] = buildPhoneListUiSchema();
    fieldUi.items = itemUi;

    const fieldOptions = isRecord(fieldUi['ui:options'])
        ? fieldUi['ui:options']
        : {};
    if (typeof fieldOptions.ArrayFieldTemplate !== 'string') {
        fieldOptions.ArrayFieldTemplate = 'TransactionAccordionTemplate';
    }
    fieldUi['ui:options'] = fieldOptions;
}

function ensureRepeatableItemUiMappings(
    arraySchema: Record<string, unknown>,
    fieldUi: Record<string, unknown>,
    canonicalFieldMap: Map<string, CanonicalField>,
    repeatableDescriptor?: RepeatableArrayDescriptor
): void {
    const items = isRecord(arraySchema.items) ? arraySchema.items : null;
    if (!items) return;
    const itemProperties = isRecord(items.properties) ? items.properties : null;
    if (!itemProperties) return;

    const itemUi: Record<string, unknown> = isRecord(fieldUi.items)
        ? fieldUi.items
        : {};

    if (
        repeatableDescriptor &&
        isPartyRepeatableDescriptor(repeatableDescriptor)
    ) {
        const existingItemOptions = isRecord(itemUi['ui:options'])
            ? itemUi['ui:options']
            : {};
        itemUi['ui:options'] = {
            ...existingItemOptions,
            ObjectFieldTemplate:
                typeof existingItemOptions.ObjectFieldTemplate === 'string'
                    ? existingItemOptions.ObjectFieldTemplate
                    : 'PartyCardFieldTemplate',
            label:
                typeof existingItemOptions.label === 'boolean'
                    ? existingItemOptions.label
                    : false,
            nobackground:
                typeof existingItemOptions.nobackground === 'boolean'
                    ? existingItemOptions.nobackground
                    : true,
        };
    }

    for (const [itemKey, itemSchema] of Object.entries(itemProperties)) {
        const schemaType =
            isRecord(itemSchema) && typeof itemSchema.type === 'string'
                ? itemSchema.type
                : undefined;
        const isComplexSchema =
            schemaType === 'array' || schemaType === 'object';
        if (isRecord(itemSchema)) {
            const canonical =
                canonicalFieldMap.get(itemKey) ??
                ({
                    key: itemKey,
                    label:
                        typeof itemSchema.title === 'string'
                            ? itemSchema.title
                            : humanizeFieldKey(itemKey),
                    type: inferCanonicalTypeFromFieldKey(itemKey),
                    required: false,
                    constraints: [],
                } as CanonicalField);
            applyCanonicalValidationHints(itemSchema, canonical);
        }
        const existing = isRecord(itemUi[itemKey]) ? itemUi[itemKey] : null;
        if (!existing) {
            if (!isComplexSchema) {
                const canonical = canonicalFieldMap.get(itemKey);
                itemUi[itemKey] = canonical
                    ? uiSchemaForCanonicalField(canonical)
                    : buildSchemaAndUiFromCanonical(itemKey).ui;
            }
        } else if (
            !isComplexSchema &&
            !normalizeUiWidget(existing['ui:widget'])
        ) {
            const canonical = canonicalFieldMap.get(itemKey);
            const fallbackUi = canonical
                ? uiSchemaForCanonicalField(canonical)
                : buildSchemaAndUiFromCanonical(itemKey).ui;
            itemUi[itemKey] = {
                ...fallbackUi,
                ...existing,
            };
        }

        if (isRecord(itemSchema) && looksAddressObjectSchema(itemSchema)) {
            const currentItemUi = isRecord(itemUi[itemKey])
                ? itemUi[itemKey]
                : {};
            const currentOptions = isRecord(currentItemUi['ui:options'])
                ? currentItemUi['ui:options']
                : {};
            itemUi[itemKey] = {
                ...currentItemUi,
                'ui:options': {
                    ...currentOptions,
                    ObjectFieldTemplate:
                        typeof currentOptions.ObjectFieldTemplate === 'string'
                            ? currentOptions.ObjectFieldTemplate
                            : 'AddressFieldTemplate',
                },
            };
        }

        if (isRecord(itemSchema) && isRecord(itemUi[itemKey])) {
            itemUi[itemKey] = repairSelectUiWithoutOptions(
                itemKey,
                itemSchema,
                itemUi[itemKey] as Record<string, unknown>
            );
        }
    }

    fieldUi.items = itemUi;
}

function humanizeFieldKey(fieldKey: string): string {
    const words = fieldKey
        .replace(/\[\]/g, '')
        .split(/[_\s]+/)
        .filter(Boolean);

    return words
        .map((word) => {
            const upper = word.toUpperCase();
            if (upper === 'SSN') return 'SSN';
            if (upper === 'ID') return 'ID';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

function inferCanonicalTypeFromFieldKey(
    fieldKey: string
): CanonicalField['type'] {
    const key = fieldKey.toLowerCase();
    if (key.includes('date')) return 'date';
    if (key.includes('email')) return 'email';
    if (key.includes('phone')) return 'phone';
    if (
        key.includes('ssn') ||
        key.includes('tax_id') ||
        key.includes('tax id')
    ) {
        return 'ssn';
    }
    if (
        key.includes('share') ||
        key.includes('percentage') ||
        key.includes('allocation')
    ) {
        return 'number';
    }
    if (key.includes('count') || key.includes('days')) return 'integer';
    return 'string';
}

function buildSchemaAndUiFromCanonical(
    fieldKey: string,
    canonical?: CanonicalField
): {
    schema: Record<string, unknown>;
    ui: Record<string, unknown>;
} {
    if (canonical) {
        const schemaEntry: Record<string, unknown> = {
            type: canonicalTypeToJsonType(canonical.type),
            title: canonical.label,
        };
        applyCanonicalValidationHints(schemaEntry, canonical);
        if (
            /(share|percentage|allocation)/i.test(fieldKey) &&
            (canonical.type === 'number' || canonical.type === 'integer')
        ) {
            schemaEntry.minimum = schemaEntry.minimum ?? 0;
            schemaEntry.maximum = schemaEntry.maximum ?? 100;
        }
        if (
            canonical.type === 'select' &&
            canonical.options &&
            canonical.options.length > 0
        ) {
            schemaEntry.oneOf = canonical.options.map((option) => ({
                const: option.value,
                title: option.label,
            }));
        }
        return {
            schema: schemaEntry,
            ui: uiSchemaForCanonicalField(canonical),
        };
    }

    const inferredType = inferCanonicalTypeFromFieldKey(fieldKey);
    const syntheticCanonical: CanonicalField = {
        key: fieldKey,
        label: humanizeFieldKey(fieldKey),
        type: inferredType,
        required: false,
        constraints: [],
    };
    const schemaEntry: Record<string, unknown> = {
        type: canonicalTypeToJsonType(inferredType),
        title: syntheticCanonical.label,
    };
    applyCanonicalValidationHints(schemaEntry, syntheticCanonical);
    if (
        /(share|percentage|allocation)/i.test(fieldKey) &&
        (inferredType === 'number' || inferredType === 'integer')
    ) {
        schemaEntry.minimum = 0;
        schemaEntry.maximum = 100;
    }
    return {
        schema: schemaEntry,
        ui: uiSchemaForCanonicalField(syntheticCanonical),
    };
}

function buildRepeatableArrayField(
    descriptor: RepeatableArrayDescriptor,
    canonicalFieldMap: Map<string, CanonicalField>
): {
    schema: Record<string, unknown>;
    ui: Record<string, unknown>;
} {
    const itemProperties: Record<string, unknown> = {};
    const itemRequired: string[] = [];
    const itemUi: Record<string, unknown> = {};

    for (const rowFieldKey of descriptor.rowFieldKeys) {
        const canonical = canonicalFieldMap.get(rowFieldKey);
        const built = buildSchemaAndUiFromCanonical(rowFieldKey, canonical);
        itemProperties[rowFieldKey] = built.schema;
        itemUi[rowFieldKey] = built.ui;
        if (canonical?.required) {
            itemRequired.push(rowFieldKey);
        }
    }

    if (itemRequired.length === 0) {
        const preferred = descriptor.rowFieldKeys.find((fieldKey) =>
            /(name|full_name|full_legal_name)/i.test(fieldKey)
        );
        if (preferred && itemProperties[preferred] != null) {
            itemRequired.push(preferred);
        } else if (
            descriptor.rowFieldKeys[0] &&
            itemProperties[descriptor.rowFieldKeys[0]]
        ) {
            itemRequired.push(descriptor.rowFieldKeys[0]);
        }
    }

    const schema: Record<string, unknown> = {
        type: 'array',
        title: descriptor.title,
        items: {
            type: 'object',
            title: singularizeLabel(descriptor.title),
            properties: itemProperties,
            required: itemRequired,
        },
    };

    if (descriptor.requiredByDefault) {
        schema.minItems = Math.max(1, descriptor.minItems ?? 1);
    } else if ((descriptor.minItems ?? 0) > 0) {
        schema.minItems = descriptor.minItems;
    }

    if ((descriptor.maxItems ?? 0) > 0) {
        schema.maxItems = descriptor.maxItems;
    }

    const isPartyRepeatable = isPartyRepeatableDescriptor(descriptor);
    const uiOptions: Record<string, unknown> = {
        ArrayFieldTemplate: isPartyRepeatable
            ? 'TransactionAccordionTemplate'
            : 'ArrayFieldTemplate',
        addable: true,
        removable: true,
        orderable: false,
        defaultTitle: singularizeLabel(descriptor.title),
    };
    if (isPartyRepeatable) {
        uiOptions.showDeleteBtn = true;
        uiOptions.showAddBtn = true;
        uiOptions.showRemoveItemBtn = true;
        uiOptions.allowContentDisabled = true;
        uiOptions.templateId = descriptor.arrayFieldKey;
    }
    if (!shouldKeepStaticArrayHeader(descriptor.arrayFieldKey, descriptor)) {
        const titlePaths = inferArrayTitlePathsFromFieldKeys(
            Object.keys(itemProperties)
        );
        if (titlePaths.length > 0) {
            uiOptions.titlePaths = titlePaths;
        }
    }

    if (isPartyRepeatable) {
        const itemOptions = isRecord(itemUi['ui:options'])
            ? itemUi['ui:options']
            : {};
        itemUi['ui:options'] = {
            ...itemOptions,
            ObjectFieldTemplate:
                typeof itemOptions.ObjectFieldTemplate === 'string'
                    ? itemOptions.ObjectFieldTemplate
                    : 'PartyCardFieldTemplate',
            label: false,
            nobackground: true,
        };
    }

    const ui: Record<string, unknown> = {
        'ui:options': uiOptions,
        items: itemUi,
    };

    return { schema, ui };
}

function fallbackSchemaGeneration(
    canonicalModel: CanonicalModel,
    tabInference: TabInference
): SchemaGenerationResult {
    const canonicalFieldMap = canonicalFieldsByKey(canonicalModel);
    const repeatableByFieldRef =
        mapRepeatableDescriptorByFieldRef(canonicalModel);

    return {
        tabSchemas: tabInference.tabSchemas.map((tab) => {
            const properties: Record<string, unknown> = {};
            const uiSchema: Record<string, unknown> = {
                'ui:submitButtonOptions': { norender: true },
            };
            const required: string[] = [];

            for (const fieldRef of tab.fieldRefs) {
                const repeatableDescriptor = repeatableByFieldRef.get(
                    toMachineKey(fieldRef)
                );
                if (repeatableDescriptor) {
                    const repeatable = buildRepeatableArrayField(
                        repeatableDescriptor,
                        canonicalFieldMap
                    );
                    properties[fieldRef] = repeatable.schema;
                    uiSchema[fieldRef] = repeatable.ui;
                    if (repeatableDescriptor.requiredByDefault) {
                        required.push(fieldRef);
                    }
                    continue;
                }

                const canonical = canonicalFieldMap.get(fieldRef);
                const built = buildSchemaAndUiFromCanonical(
                    fieldRef,
                    canonical
                );
                properties[fieldRef] = built.schema;
                uiSchema[fieldRef] = built.ui;
                if (canonical?.required) {
                    required.push(fieldRef);
                }
            }

            return {
                id: tab.id,
                title: tab.title,
                formSchema: {
                    type: 'object',
                    title: tab.title,
                    properties,
                    required,
                },
                uiSchema,
                priorHintsApplied: [],
            };
        }),
        notes: ['Fallback schema generation used due to LLM parse issue.'],
    };
}

function sanitizeGeneratedTabSchemas(
    generated: SchemaGenerationResult,
    canonicalModel: CanonicalModel,
    tabInference: TabInference
): SchemaGenerationResult {
    const canonicalFieldMap = canonicalFieldsByKey(canonicalModel);
    const repeatableByFieldRef =
        mapRepeatableDescriptorByFieldRef(canonicalModel);
    const fallback = fallbackSchemaGeneration(canonicalModel, tabInference);

    const generatedTabs = Array.isArray(generated.tabSchemas)
        ? generated.tabSchemas
        : [];
    const generatedById = new Map<string, (typeof generatedTabs)[number]>();
    const generatedByTitle = new Map<string, (typeof generatedTabs)[number]>();

    for (const tab of generatedTabs) {
        if (!isRecord(tab)) continue;
        if (typeof tab.id === 'string') {
            generatedById.set(tab.id, tab);
        }
        if (typeof tab.title === 'string') {
            generatedByTitle.set(tab.title.toLowerCase(), tab);
        }
    }

    const normalized = tabInference.tabSchemas.map((tabPlan, idx) => {
        const fromLlm =
            generatedById.get(tabPlan.id) ??
            generatedByTitle.get(tabPlan.title.toLowerCase());
        const fallbackTab = fallback.tabSchemas[idx];

        if (!fromLlm || !isRecord(fromLlm)) {
            return fallbackTab;
        }

        const formSchema = isRecord(fromLlm.formSchema)
            ? fromLlm.formSchema
            : isRecord(fallbackTab.formSchema)
            ? fallbackTab.formSchema
            : {};
        const uiSchema = isRecord(fromLlm.uiSchema)
            ? fromLlm.uiSchema
            : isRecord(fallbackTab.uiSchema)
            ? fallbackTab.uiSchema
            : {};
        const finalUiSchema: Record<string, unknown> = {
            ...uiSchema,
            'ui:submitButtonOptions': { norender: true },
        };

        const rawProperties = isRecord(formSchema.properties)
            ? formSchema.properties
            : {};
        const properties: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(rawProperties)) {
            if (isRecord(value)) {
                properties[key] = value;
            }
        }

        if (Object.keys(properties).length === 0 && fallbackTab) {
            const fallbackProps = isRecord(fallbackTab.formSchema.properties)
                ? fallbackTab.formSchema.properties
                : {};
            for (const [key, value] of Object.entries(fallbackProps)) {
                properties[key] = value;
            }
        }

        for (const [key, schemaValue] of Object.entries(properties)) {
            if (!isRecord(schemaValue)) continue;
            const canonical =
                canonicalFieldMap.get(key) ??
                ((typeof schemaValue.type === 'string' &&
                (schemaValue.type === 'string' ||
                    schemaValue.type === 'number' ||
                    schemaValue.type === 'integer' ||
                    schemaValue.type === 'boolean')
                    ? {
                          key,
                          label:
                              typeof schemaValue.title === 'string'
                                  ? schemaValue.title
                                  : humanizeFieldKey(key),
                          type: inferCanonicalTypeFromFieldKey(key),
                          required: false,
                          constraints: [],
                      }
                    : null) as CanonicalField | null);
            if (canonical) {
                applyCanonicalValidationHints(schemaValue, canonical);
            }
        }

        // Ensure canonical planned fields are present when possible.
        for (const fieldRef of tabPlan.fieldRefs) {
            if (properties[fieldRef]) continue;
            const repeatableDescriptor = repeatableByFieldRef.get(
                toMachineKey(fieldRef)
            );
            if (repeatableDescriptor) {
                const repeatable = buildRepeatableArrayField(
                    repeatableDescriptor,
                    canonicalFieldMap
                );
                properties[fieldRef] = repeatable.schema;
                finalUiSchema[fieldRef] = repeatable.ui;
                continue;
            }
            const canonical = canonicalFieldMap.get(fieldRef);
            const built = buildSchemaAndUiFromCanonical(fieldRef, canonical);
            properties[fieldRef] = built.schema;
            finalUiSchema[fieldRef] = built.ui;
        }

        for (const [key, schemaValue] of Object.entries(properties)) {
            if (!isRecord(schemaValue)) continue;
            if (schemaValue.type !== 'array') continue;
            if (isRecord(schemaValue.items)) continue;

            const repeatableDescriptor = repeatableByFieldRef.get(
                toMachineKey(key)
            );
            if (repeatableDescriptor) {
                const repeatable = buildRepeatableArrayField(
                    repeatableDescriptor,
                    canonicalFieldMap
                );
                properties[key] = repeatable.schema;
                finalUiSchema[key] = repeatable.ui;
                continue;
            }

            schemaValue.items = {
                type: 'object',
                title: `${humanizeFieldKey(key)} Item`,
                properties: {
                    value: { type: 'string', title: 'Value' },
                },
            };
            if (!isRecord(finalUiSchema[key])) {
                finalUiSchema[key] = {};
            }
            if (
                isRecord(finalUiSchema[key]) &&
                !isRecord(finalUiSchema[key].items)
            ) {
                finalUiSchema[key].items = {
                    value: { 'ui:widget': 'TextWidget' },
                };
            }
        }

        for (const [key, schemaValue] of Object.entries(properties)) {
            if (!isRecord(schemaValue)) continue;
            if (schemaValue.type !== 'array') continue;

            const repeatableDescriptor = repeatableByFieldRef.get(
                toMachineKey(key)
            );
            const existingUi = isRecord(finalUiSchema[key])
                ? finalUiSchema[key]
                : {};
            const existingOptions = isRecord(existingUi['ui:options'])
                ? existingUi['ui:options']
                : {};

            const nextOptions: Record<string, unknown> = {
                ...existingOptions,
            };
            if (
                typeof nextOptions.defaultTitle !== 'string' ||
                nextOptions.defaultTitle.trim().length === 0
            ) {
                nextOptions.defaultTitle = inferDefaultArrayItemTitle(
                    key,
                    schemaValue,
                    repeatableDescriptor
                );
            }

            if (shouldKeepStaticArrayHeader(key, repeatableDescriptor)) {
                if (Array.isArray(nextOptions.titlePaths)) {
                    delete nextOptions.titlePaths;
                }
            } else if (
                !Array.isArray(nextOptions.titlePaths) ||
                nextOptions.titlePaths.length === 0
            ) {
                const inferredTitlePaths =
                    inferArrayTitlePathsFromItemsSchema(schemaValue);
                if (inferredTitlePaths.length > 0) {
                    nextOptions.titlePaths = inferredTitlePaths;
                }
            }

            finalUiSchema[key] = {
                ...existingUi,
                'ui:options': nextOptions,
            };

            if (isRecord(finalUiSchema[key])) {
                transformRepeatableItemPhoneScalarToPhoneList(
                    key,
                    schemaValue,
                    finalUiSchema[key] as Record<string, unknown>
                );
                ensureRepeatableItemUiMappings(
                    schemaValue,
                    finalUiSchema[key] as Record<string, unknown>,
                    canonicalFieldMap,
                    repeatableDescriptor
                );
            }
        }

        const requiredRaw = Array.isArray(formSchema.required)
            ? formSchema.required
            : Array.isArray(fallbackTab.formSchema.required)
            ? fallbackTab.formSchema.required
            : [];

        const required = requiredRaw
            .filter((value): value is string => typeof value === 'string')
            .filter((value) =>
                Object.prototype.hasOwnProperty.call(properties, value)
            );

        for (const key of Object.keys(properties)) {
            if (!isRecord(finalUiSchema[key])) {
                const canonical = canonicalFieldMap.get(key);
                finalUiSchema[key] = canonical
                    ? uiSchemaForCanonicalField(canonical)
                    : buildSchemaAndUiFromCanonical(key).ui;
            }
            if (isRecord(properties[key]) && isRecord(finalUiSchema[key])) {
                finalUiSchema[key] = repairSelectUiWithoutOptions(
                    key,
                    properties[key] as Record<string, unknown>,
                    finalUiSchema[key] as Record<string, unknown>
                );
            }
        }

        for (const [key, value] of Object.entries(properties)) {
            if (!isRecord(value)) continue;
            if (!looksAddressObjectSchema(value)) continue;

            const existingUi = isRecord(finalUiSchema[key])
                ? finalUiSchema[key]
                : {};
            const options = isRecord(existingUi['ui:options'])
                ? existingUi['ui:options']
                : {};
            finalUiSchema[key] = {
                ...existingUi,
                'ui:options': {
                    ...options,
                    ObjectFieldTemplate:
                        typeof options.ObjectFieldTemplate === 'string'
                            ? options.ObjectFieldTemplate
                            : 'AddressFieldTemplate',
                },
            };
        }

        const priorHintsApplied = Array.isArray(fromLlm.priorHintsApplied)
            ? fromLlm.priorHintsApplied.filter(
                  (entry): entry is string => typeof entry === 'string'
              )
            : [];

        return {
            id: typeof fromLlm.id === 'string' ? fromLlm.id : tabPlan.id,
            title:
                typeof fromLlm.title === 'string'
                    ? fromLlm.title
                    : tabPlan.title,
            formSchema: {
                type: 'object',
                title:
                    typeof formSchema.title === 'string'
                        ? formSchema.title
                        : tabPlan.title,
                properties,
                required,
            },
            uiSchema: finalUiSchema,
            priorHintsApplied,
        };
    });

    return {
        tabSchemas: normalized,
        notes: Array.isArray(generated.notes)
            ? generated.notes.filter(
                  (entry): entry is string => typeof entry === 'string'
              )
            : fallback.notes,
    };
}

function shouldRetrySchemaGeneration(
    schemaGeneration: SchemaGenerationResult,
    tabInference: TabInference
): boolean {
    if (!Array.isArray(schemaGeneration.tabSchemas)) {
        return true;
    }

    if (schemaGeneration.tabSchemas.length === 0) {
        return true;
    }

    const byId = new Set(
        schemaGeneration.tabSchemas
            .map((tab) => tab?.id)
            .filter(
                (id): id is string =>
                    typeof id === 'string' && id.trim().length > 0
            )
    );

    const missingPlannedTabs = tabInference.tabSchemas.filter(
        (tab) => !byId.has(tab.id)
    ).length;

    if (missingPlannedTabs >= 2) {
        return true;
    }

    let tabsWithNoProperties = 0;
    for (const tab of schemaGeneration.tabSchemas) {
        const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
        const properties = isRecord(formSchema.properties)
            ? formSchema.properties
            : {};
        if (Object.keys(properties).length === 0) {
            tabsWithNoProperties += 1;
        }
    }

    return (
        tabsWithNoProperties >
        Math.max(1, Math.floor(schemaGeneration.tabSchemas.length / 2))
    );
}

function applyFixedTabTemplates(
    schemaGeneration: SchemaGenerationResult,
    canonicalModel: CanonicalModel,
    templates: Awaited<ReturnType<typeof getFixedTabTemplates>>
): SchemaGenerationResult {
    if (!isFixedArchetype(canonicalModel.archetype)) {
        return schemaGeneration;
    }

    const normalizedTabs = schemaGeneration.tabSchemas.map((tab) => {
        const name = normalizeKey(tab.title);

        if (tab.id === 'owner_details' || name === 'owner details') {
            return {
                ...tab,
                title: templates.ownerDetails.title,
                formSchema: templates.ownerDetails.formSchema,
                uiSchema: templates.ownerDetails.uiSchema,
                priorHintsApplied: [
                    ...(tab.priorHintsApplied ?? []),
                    'Applied fixed Owner Details template from initiate-benechange-transaction.',
                ],
            };
        }

        if (tab.id === 'summary' || name === 'summary') {
            return {
                ...tab,
                title: templates.summary.title,
                formSchema: templates.summary.formSchema,
                uiSchema: templates.summary.uiSchema,
                priorHintsApplied: [
                    ...(tab.priorHintsApplied ?? []),
                    'Applied fixed Summary template from initiate-benechange-transaction.',
                ],
            };
        }

        if (tab.id === 'signature' || name === 'signature') {
            return {
                ...tab,
                title: templates.signature.title,
                formSchema: templates.signature.formSchema,
                uiSchema: templates.signature.uiSchema,
                priorHintsApplied: [
                    ...(tab.priorHintsApplied ?? []),
                    'Applied fixed Signature template from initiate-benechange-transaction.',
                ],
            };
        }

        if (tab.id === 'confirm' || name === 'confirm') {
            return {
                ...tab,
                title: templates.confirm.title,
                formSchema: templates.confirm.formSchema,
                uiSchema: templates.confirm.uiSchema,
                priorHintsApplied: [
                    ...(tab.priorHintsApplied ?? []),
                    'Applied fixed Confirm template.',
                ],
            };
        }

        return tab;
    });

    return {
        tabSchemas: normalizedTabs,
        notes: [
            ...schemaGeneration.notes,
            'Fixed templates applied for Owner Details, Signature, Summary, and Confirm tabs.',
        ],
    };
}

function buildQualityReport(
    tabInference: TabInference,
    schemaGeneration: SchemaGenerationResult,
    archetypeContextPack: ArchetypeContextPack
): GenerationQualityReport {
    const schemaTabs = schemaGeneration.tabSchemas;
    const fixedTitles = ['Owner Details', 'Signature', 'Summary', 'Confirm'];

    const fixedTabReuse = fixedTitles.map((title) => {
        const tab = schemaTabs.find(
            (entry) => normalizeKey(entry.title) === normalizeKey(title)
        );
        const formSchema =
            tab && isRecord(tab.formSchema) ? tab.formSchema : {};
        const properties = isRecord(formSchema.properties)
            ? formSchema.properties
            : {};
        const usedFixedTemplate =
            !!tab &&
            Array.isArray(tab.priorHintsApplied) &&
            tab.priorHintsApplied.some((hint) =>
                hint.toLowerCase().includes('applied fixed')
            );
        return {
            title,
            usedFixedTemplate,
            fieldCount: Object.keys(properties).length,
        };
    });

    const dynamicInference =
        tabInference.tabSchemas.find(
            (tab) =>
                !['owner details', 'summary', 'signature', 'confirm'].includes(
                    normalizeKey(tab.title)
                )
        ) ?? tabInference.tabSchemas[0];

    const dynamicSchema =
        schemaTabs.find(
            (tab) =>
                normalizeKey(tab.title) ===
                normalizeKey(dynamicInference?.title ?? '')
        ) ??
        schemaTabs[1] ??
        schemaTabs[0];

    const dynamicForm =
        dynamicSchema && isRecord(dynamicSchema.formSchema)
            ? dynamicSchema.formSchema
            : {};
    const dynamicProps = isRecord(dynamicForm.properties)
        ? dynamicForm.properties
        : {};
    const generatedFieldKeys = Object.keys(dynamicProps);

    const plannedFieldRefs = dynamicInference?.fieldRefs ?? [];
    const plannedSet = new Set(plannedFieldRefs);
    const generatedCoverage =
        plannedSet.size > 0
            ? Number(
                  (
                      generatedFieldKeys.filter((key) => plannedSet.has(key))
                          .length / plannedSet.size
                  ).toFixed(3)
              )
            : 0;

    const topPrior = archetypeContextPack.tabPriors[0];
    const priorFields = new Set(
        (topPrior?.commonFields ?? []).map((f) => f.fieldPath)
    );
    const priorAlignment =
        priorFields.size > 0
            ? Number(
                  (
                      generatedFieldKeys.filter((key) => priorFields.has(key))
                          .length / priorFields.size
                  ).toFixed(3)
              )
            : 0;

    return {
        fixedTabReuse,
        dynamicMiddle: {
            title:
                dynamicSchema?.title ??
                dynamicInference?.title ??
                'Dynamic Middle',
            generatedFieldCount: generatedFieldKeys.length,
            canonicalFieldCoverage: generatedCoverage,
            priorAlignment,
        },
        notes: [
            'canonicalFieldCoverage = overlap between planned dynamic fieldRefs and generated properties.',
            'priorAlignment = overlap between generated dynamic fields and top prior tab fields.',
        ],
    };
}

function toTaskType(transactionKeySuggestion: string): string {
    const normalized = transactionKeySuggestion
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_]+/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_+|_+$/g, '');
    return normalized || 'AI_GENERATED_TRANSACTION';
}

function buildFullRjsfOutput(
    canonicalModel: CanonicalModel,
    schemaGeneration: SchemaGenerationResult,
    fixedSkeletonApplied: boolean
): FullRjsfOutput {
    return {
        formId: randomUUID(),
        process: 'Policy Update',
        processSubType:
            canonicalModel.transactionName || 'AI Generated Transaction',
        taskType: toTaskType(canonicalModel.transactionKeySuggestion),
        formSchema: { type: 'object' },
        uiSchema: { type: 'object' },
        schemaContent: {
            tabSchemas: schemaGeneration.tabSchemas.map((tab) => ({
                title: tab.title,
                formSchema: tab.formSchema,
                uiSchema: tab.uiSchema,
            })),
        },
        generationMeta: {
            archetype: canonicalModel.archetype,
            source: 'ai_phase2_generation',
            fixedSkeletonApplied,
            generatedAt: new Date().toISOString(),
            notes: schemaGeneration.notes,
        },
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<InferFromPdfResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res
            .status(405)
            .json({ error: `Method ${req.method} not allowed` });
    }

    if (isProd()) {
        return res.status(404).json({ error: 'Not found' });
    }

    if (!process.env.OPEN_AI_API_KEY) {
        return res.status(400).json({
            error: 'Missing OPEN_AI_API_KEY. Add it to .env.development.local and restart dev server.',
        });
    }

    const form = formidable({
        maxFileSize: MAX_BYTES,
        allowEmptyFiles: false,
    });

    let tempFilePath = '';

    try {
        const [fields, files] = await form.parse(req);
        const file = getFirstUploadedFile(files, ['file', 'pdf']);
        if (!file) {
            return res.status(400).json({
                error: 'Missing file field. Use multipart field name `file` or `pdf`.',
            });
        }

        const mime = file.mimetype ?? '';
        if (!mime.includes('pdf')) {
            return res.status(400).json({
                error: `Expected application/pdf, got: ${mime || 'unknown'}`,
            });
        }

        tempFilePath = file.filepath;
        const fileBuffer = await fs.readFile(file.filepath);

        const maxPagesRaw =
            getFieldValue(fields, 'maxPages') ??
            (typeof req.query.maxPages === 'string'
                ? req.query.maxPages
                : undefined);
        const parsedMaxPages = maxPagesRaw
            ? Number.parseInt(maxPagesRaw, 10)
            : NaN;
        const maxPages = Number.isFinite(parsedMaxPages)
            ? parsedMaxPages
            : undefined;

        const itemsModeRaw =
            getFieldValue(fields, 'itemsMode') ??
            (typeof req.query.itemsMode === 'string'
                ? req.query.itemsMode
                : undefined);
        const itemsMode = parseItemsMode(itemsModeRaw);

        const transactionHint = getFieldValue(
            fields,
            'transactionHint'
        )?.trim();

        const extraction = await extractPdfTextAndLayout(fileBuffer, {
            maxPages,
            itemsMode,
        });
        const llmReadyPayload = buildLlmReadyPayload(extraction);

        const canonicalSystemPrompt = buildCanonicalModelPrompt();
        const canonicalUserPayload = {
            transactionHint: transactionHint || null,
            extraction: llmReadyPayload,
        };
        const canonicalCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0,
            seed: 42,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: canonicalSystemPrompt,
                },
                {
                    role: 'user',
                    content: deterministicStringify(canonicalUserPayload, 2),
                },
            ],
        });

        let canonicalRaw =
            canonicalCompletion.choices[0]?.message?.content ?? '{}';
        let canonicalModel = enrichCanonicalRepeatablesFromFieldPrefixes(
            enrichCanonicalRepeatablesFromExtraction(
                normalizeCanonicalModel(
                    safeJsonParse<CanonicalModel>(
                        canonicalRaw,
                        defaultCanonicalModel(transactionHint)
                    )
                ),
                llmReadyPayload
            )
        );
        if (shouldRetryCanonicalModel(canonicalModel, llmReadyPayload)) {
            const canonicalRetryCompletion =
                await openai.chat.completions.create({
                    model: 'gpt-4o',
                    temperature: 0,
                    seed: 42,
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content: canonicalSystemPrompt,
                        },
                        {
                            role: 'user',
                            content: deterministicStringify(
                                {
                                    ...canonicalUserPayload,
                                    retryInstruction:
                                        'Repair the canonical model. Ensure repeatableEntities include rowFields and variants when structured groups exist.',
                                    previousResponse: safeJsonParse<unknown>(
                                        canonicalRaw,
                                        {}
                                    ),
                                },
                                2
                            ),
                        },
                    ],
                });
            canonicalRaw =
                canonicalRetryCompletion.choices[0]?.message?.content ?? '{}';
            canonicalModel = enrichCanonicalRepeatablesFromFieldPrefixes(
                enrichCanonicalRepeatablesFromExtraction(
                    normalizeCanonicalModel(
                        safeJsonParse<CanonicalModel>(
                            canonicalRaw,
                            canonicalModel
                        )
                    ),
                    llmReadyPayload
                )
            );
        }
        const archetypeContextPack = await getArchetypeContextPack(
            canonicalModel.archetype
        );

        const fixedSkeletonCandidate = isFixedArchetype(
            canonicalModel.archetype
        );
        let rawTabInference: TabInference;
        if (fixedSkeletonCandidate) {
            rawTabInference = {
                ...defaultTabInference(canonicalModel.archetype),
                notes: [
                    'Tab inference bypassed for fixed-skeleton archetype; tab plan derived from canonical model.',
                ],
            };
        } else {
            const tabCompletion = await openai.chat.completions.create({
                model: 'gpt-4o',
                temperature: 0,
                seed: 42,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: buildTabInferencePrompt(),
                    },
                    {
                        role: 'user',
                        content: deterministicStringify(
                            {
                                transactionHint: transactionHint || null,
                                canonicalModel,
                                archetypeContextPack,
                            },
                            2
                        ),
                    },
                ],
            });

            const tabRaw = tabCompletion.choices[0]?.message?.content ?? '{}';
            rawTabInference = safeJsonParse<TabInference>(
                tabRaw,
                defaultTabInference(canonicalModel.archetype)
            );
        }
        const pdfFormName =
            llmReadyPayload.inferredFormName?.trim() ||
            canonicalModel.transactionName?.trim() ||
            transactionHint ||
            'Transaction Details';
        const tabInference = enforceFixedTabSkeleton(
            canonicalModel,
            rawTabInference,
            pdfFormName
        );
        const fixedSkeletonApplied = isFixedArchetype(canonicalModel.archetype);
        const fixedTemplates = fixedSkeletonApplied
            ? await getFixedTabTemplates()
            : null;
        const phase2Context = buildPhase2Context(
            llmReadyPayload,
            canonicalModel,
            tabInference,
            archetypeContextPack,
            pdfFormName
        );

        const schemaSystemPrompt = buildTabSchemaGenerationPrompt();
        const schemaUserPayload = {
            transactionHint: transactionHint || null,
            phase2Context,
        };
        const schemaCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0,
            seed: 42,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: schemaSystemPrompt,
                },
                {
                    role: 'user',
                    content: deterministicStringify(schemaUserPayload, 2),
                },
            ],
        });

        let schemaRaw = schemaCompletion.choices[0]?.message?.content ?? '{}';
        let rawSchemaGeneration = safeJsonParse<SchemaGenerationResult>(
            schemaRaw,
            fallbackSchemaGeneration(canonicalModel, tabInference)
        );
        if (shouldRetrySchemaGeneration(rawSchemaGeneration, tabInference)) {
            const schemaRetryCompletion = await openai.chat.completions.create({
                model: 'gpt-4o',
                temperature: 0,
                seed: 42,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: schemaSystemPrompt,
                    },
                    {
                        role: 'user',
                        content: deterministicStringify(
                            {
                                ...schemaUserPayload,
                                retryInstruction:
                                    'Repair tabSchemas to fully cover tabPlan. Ensure array fields always include items schema.',
                                previousResponse: safeJsonParse<unknown>(
                                    schemaRaw,
                                    {}
                                ),
                            },
                            2
                        ),
                    },
                ],
            });
            schemaRaw =
                schemaRetryCompletion.choices[0]?.message?.content ?? '{}';
            rawSchemaGeneration = safeJsonParse<SchemaGenerationResult>(
                schemaRaw,
                rawSchemaGeneration
            );
            rawSchemaGeneration.notes = [
                ...(Array.isArray(rawSchemaGeneration.notes)
                    ? rawSchemaGeneration.notes
                    : []),
                'Schema generation retried after structural validation checks.',
            ];
        }
        const schemaGeneration = sanitizeGeneratedTabSchemas(
            rawSchemaGeneration,
            canonicalModel,
            tabInference
        );
        const schemaWithFixedTabs =
            fixedTemplates != null
                ? applyFixedTabTemplates(
                      schemaGeneration,
                      canonicalModel,
                      fixedTemplates
                  )
                : schemaGeneration;
        const fullRjsfOutput = buildFullRjsfOutput(
            canonicalModel,
            schemaWithFixedTabs,
            fixedSkeletonApplied
        );
        const qualityReport = buildQualityReport(
            tabInference,
            schemaWithFixedTabs,
            archetypeContextPack
        );

        return res.status(200).json({
            extraction,
            llmReadyPayload,
            canonicalModel,
            archetypeContextPack,
            tabInference,
            phase2Context,
            schemaGeneration: schemaWithFixedTabs,
            fullRjsfOutput,
            qualityReport,
        });
    } catch (error) {
        return res.status(500).json({
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to run PDF to full RJSF pipeline',
        });
    } finally {
        if (tempFilePath) {
            await fs.unlink(tempFilePath).catch(() => undefined);
        }
    }
}
