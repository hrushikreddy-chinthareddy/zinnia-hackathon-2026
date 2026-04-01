'use client';

import { useCallback, useMemo, useState } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import { isProd } from '@deps/utils/environment.helpers';

type ExtractPage = {
    pageNumber?: number;
    fullText?: string;
};

type ExtractPayload = {
    mode?: string;
    itemsMode?: string;
    pageCount?: number;
    pagesProcessed?: number;
    pages?: ExtractPage[];
    warnings?: string[];
};

type RepeatedLabel = {
    label: string;
    occurrences: number;
};

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

function collectRepeatedShortLabels(lines: string[]): RepeatedLabel[] {
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
        .sort((a, b) => {
            if (b.occurrences !== a.occurrences) {
                return b.occurrences - a.occurrences;
            }
            return a.label.localeCompare(b.label);
        })
        .slice(0, 20);
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

        const key = line.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

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

    const seen = new Set<string>();
    const constraints: string[] = [];
    for (const line of lines) {
        if (!patterns.some((pattern) => pattern.test(line))) continue;
        if (seen.has(line)) continue;
        seen.add(line);
        constraints.push(line);
        if (constraints.length >= 20) break;
    }

    return constraints;
}

function buildLlmReadyPayload(result: unknown): string {
    if (!result || typeof result !== 'object') {
        return JSON.stringify(
            {
                sourceFormText: '',
                inferredSections: [],
                inferredConstraints: [],
            },
            null,
            2
        );
    }

    const payload = result as ExtractPayload;
    const pages = Array.isArray(payload.pages) ? payload.pages : [];
    const normalizedPages = pages.map((page, index) => ({
        pageNumber: page.pageNumber ?? index + 1,
        normalizedText: normalizeForLlm(page.fullText ?? ''),
    }));

    const sourceFormText = normalizedPages
        .filter((page) => page.normalizedText.length > 0)
        .map((page) => `[PAGE ${page.pageNumber}]\n${page.normalizedText}`)
        .join('\n\n');

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

    const inferredRepeatedGroups =
        repeatedLabels.length > 0
            ? [
                  {
                      key: 'repeatableEntityCandidate',
                      rationale:
                          'Short labels repeated multiple times can indicate repeatable entities (arrays/groups).',
                      repeatedLabels,
                  },
              ]
            : [];

    const inferredSignals = {
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
            /\bcheck\b/i.test(sourceFormText) || /\bq\b/.test(sourceFormText),
    };

    const llmReadyPayload = {
        transactionContext: 'Carrier paper-form transaction extraction',
        sourceFormText,
        sourceFormTextByPage: normalizedPages,
        inferredSections,
        inferredRepeatedGroups,
        inferredConstraints: inferConstraints(sourceFormText),
        inferredSignals,
        extractionMeta: {
            mode: payload.mode ?? 'unknown',
            itemsMode: payload.itemsMode ?? 'unknown',
            pageCount: payload.pageCount ?? pages.length,
            pagesProcessed: payload.pagesProcessed ?? pages.length,
            warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
        },
    };

    return JSON.stringify(llmReadyPayload, null, 2);
}

export function ExtractPdfPreviewPanel() {
    const [file, setFile] = useState<File | null>(null);
    const [maxPages, setMaxPages] = useState<string>('');
    /** `text` = `{ text }` per run only; `full` adds x/y/transform; `none` drops items. */
    const [itemsMode, setItemsMode] = useState<'full' | 'text' | 'none'>(
        'text'
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<unknown>(null);
    const llmReadyResult = useMemo(
        () => (result == null ? null : buildLlmReadyPayload(result)),
        [result]
    );

    const disabledInProd = isProd();

    const onSubmit = useCallback(async () => {
        if (!file || disabledInProd) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const fd = new FormData();
            fd.append('file', file);

            const params = new URLSearchParams();
            if (maxPages.trim() !== '') {
                params.set('maxPages', maxPages.trim());
            }
            params.set('items', itemsMode);
            const qs = params.toString();
            const url = `/api/paper2flow/extract-pdf${qs ? `?${qs}` : ''}`;

            const res = await fetch(url, {
                method: 'POST',
                body: fd,
                credentials: 'include',
            });

            const body = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(
                    (body as { error?: string })?.error ?? `HTTP ${res.status}`
                );
                return;
            }

            setResult(body);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
        } finally {
            setLoading(false);
        }
    }, [file, maxPages, itemsMode, disabledInProd]);

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
            {disabledInProd && (
                <div
                    className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                    role="status"
                >
                    PDF extract is disabled in production builds. Use a
                    non-production environment (local dev, QA, etc.).
                </div>
            )}

            <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <label className="flex flex-col gap-2 text-sm font-medium text-gray-900">
                    PDF file
                    <input
                        type="file"
                        accept="application/pdf"
                        className="text-sm font-normal text-gray-700 file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5"
                        onChange={(e) => {
                            setFile(e.target.files?.[0] ?? null);
                            setResult(null);
                            setError(null);
                        }}
                        disabled={disabledInProd}
                    />
                </label>

                <div className="flex flex-wrap items-end gap-4">
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-900">
                        Max pages (optional)
                        <input
                            type="number"
                            min={1}
                            placeholder="All pages"
                            inputMode="numeric"
                            className="w-40 rounded border border-gray-300 px-3 py-2 text-sm"
                            value={maxPages}
                            onChange={(e) => setMaxPages(e.target.value)}
                            disabled={disabledInProd}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-gray-900">
                        Text runs (`items`)
                        <select
                            className="max-w-md rounded border border-gray-300 px-3 py-2 text-sm font-normal"
                            value={itemsMode}
                            onChange={(e) =>
                                setItemsMode(
                                    e.target.value as 'full' | 'text' | 'none'
                                )
                            }
                            disabled={disabledInProd}
                        >
                            <option value="text">
                                Text only — one object per run with
                                &quot;text&quot; key (good default for LLM)
                            </option>
                            <option value="full">
                                Full layout — includes transform, x, y, width,
                                height, fontName
                            </option>
                            <option value="none">
                                No items array — each page has fullText only
                            </option>
                        </select>
                    </label>
                </div>

                <div>
                    <Button
                        type={ButtonType.Primary}
                        size={ButtonSize.Default}
                        onClick={onSubmit}
                        disabled={!file || loading || disabledInProd}
                    >
                        {loading ? 'Extracting…' : 'Extract PDF'}
                    </Button>
                </div>

                {error && (
                    <div
                        className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                        role="alert"
                    >
                        {error}
                    </div>
                )}
            </div>

            {result != null && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                        LLM-ready extraction payload
                    </h2>
                    <p className="text-sm text-gray-600">
                        Normalized payload preview in the same shape we send to
                        the LLM.
                    </p>
                    <pre className="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-900">
                        {llmReadyResult}
                    </pre>
                    <details className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                        <summary className="cursor-pointer font-semibold text-gray-900">
                            Show raw extractor JSON
                        </summary>
                        <pre className="mt-3 max-h-[40vh] overflow-auto rounded bg-gray-50 p-3 leading-relaxed">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
}
