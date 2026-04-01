import { promises as fs } from 'fs';
import path from 'path';

import type {
    ArchetypeContextPack,
    FieldPrior,
    PriorHintCount,
    TabPrior,
    TransactionArchetype,
} from '@deps/lib/transaction-builder/pipeline-types';

const SCHEMA_DIR = path.join(
    process.cwd(),
    'src',
    'jsonschema-mock-service',
    'tasks',
    'DEFAULT'
);

const CACHE_TTL_MS = 5 * 60 * 1000;

const ALL_ARCHETYPES: TransactionArchetype[] = [
    'party_change_complex',
    'party_change_standard',
    'data_entry_processing',
    'non_financial_micro',
    'financial_other',
    'unknown',
];

type FieldAgg = {
    occurrences: number;
    requiredCount: number;
    types: Map<string, number>;
};

type TabAgg = {
    titleCounts: Map<string, number>;
    appearances: number;
    totalIndex: number;
    fields: Map<string, FieldAgg>;
    widgetCounts: Map<string, number>;
    templateCounts: Map<string, number>;
};

type ArchetypeAgg = {
    sampleSize: number;
    sourceTaskTypes: Set<string>;
    tabAggByNormalizedTitle: Map<string, TabAgg>;
    globalWidgetCounts: Map<string, number>;
    globalTemplateCounts: Map<string, number>;
};

type CacheValue = {
    loadedAt: number;
    packs: Record<TransactionArchetype, ArchetypeContextPack>;
};

let cache: CacheValue | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is string => typeof entry === 'string');
}

function normalizeTabTitle(title: string): string {
    return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function toRounded(value: number): number {
    return Number(value.toFixed(3));
}

function incrementCount(map: Map<string, number>, key: string, by = 1): void {
    map.set(key, (map.get(key) ?? 0) + by);
}

function inferArchetype(
    taskTypeRaw: string,
    processSubTypeRaw: string,
    fileNameRaw: string
): TransactionArchetype {
    const text =
        `${taskTypeRaw} ${processSubTypeRaw} ${fileNameRaw}`.toLowerCase();

    if (text.includes('data_entry') || text.includes('data-entry')) {
        return 'data_entry_processing';
    }
    if (
        text.includes('beneficiary') ||
        text.includes('benechange') ||
        text.includes('assigneechange') ||
        text.includes('annuitantchange')
    ) {
        return 'party_change_complex';
    }
    if (text.includes('ownerchange') || text.includes('owner change')) {
        return 'party_change_standard';
    }
    if (
        text.includes('bank') ||
        text.includes('withdraw') ||
        text.includes('surrender') ||
        text.includes('payout') ||
        text.includes('distribution') ||
        text.includes('payment') ||
        text.includes('financial')
    ) {
        return 'financial_other';
    }
    if (
        text.includes('address') ||
        text.includes('verification') ||
        text.includes('call') ||
        text.includes('review') ||
        text.includes('detail')
    ) {
        return 'non_financial_micro';
    }
    return 'unknown';
}

function collectFieldStatsFromSchema(
    schema: unknown,
    prefix: string,
    out: Map<string, { required: boolean; type: string }>
): void {
    if (!isRecord(schema)) return;
    const properties = isRecord(schema.properties) ? schema.properties : null;
    if (!properties) return;

    const requiredSet = new Set(asStringArray(schema.required));

    for (const [key, child] of Object.entries(properties)) {
        if (!isRecord(child)) continue;
        const pathKey = prefix ? `${prefix}.${key}` : key;
        const childType = asString(child.type) ?? 'unknown';
        const hasNestedProps = isRecord(child.properties);
        const isArray = childType === 'array';

        if (!hasNestedProps || isArray) {
            const existing = out.get(pathKey);
            if (existing) {
                out.set(pathKey, {
                    required: existing.required || requiredSet.has(key),
                    type:
                        existing.type === 'unknown' ? childType : existing.type,
                });
            } else {
                out.set(pathKey, {
                    required: requiredSet.has(key),
                    type: childType,
                });
            }
        }

        if (hasNestedProps) {
            collectFieldStatsFromSchema(child, pathKey, out);
        }

        if (isArray && isRecord(child.items)) {
            collectFieldStatsFromSchema(child.items, `${pathKey}[]`, out);
        }
    }
}

function collectUiHints(
    node: unknown,
    widgets: Map<string, number>,
    templates: Map<string, number>
): void {
    if (Array.isArray(node)) {
        for (const item of node) {
            collectUiHints(item, widgets, templates);
        }
        return;
    }

    if (!isRecord(node)) return;

    for (const [key, value] of Object.entries(node)) {
        if (key === 'ui:widget' && typeof value === 'string') {
            incrementCount(widgets, value);
        }

        if (
            (key === 'ui:ObjectFieldTemplate' ||
                key === 'ui:ArrayFieldTemplate' ||
                key === 'ui:FieldTemplate' ||
                key === 'ui:TitleFieldTemplate' ||
                key === 'ObjectFieldTemplate' ||
                key === 'ArrayFieldTemplate') &&
            typeof value === 'string'
        ) {
            incrementCount(templates, value);
        }

        collectUiHints(value, widgets, templates);
    }
}

function emptyArchetypeAgg(): ArchetypeAgg {
    return {
        sampleSize: 0,
        sourceTaskTypes: new Set<string>(),
        tabAggByNormalizedTitle: new Map<string, TabAgg>(),
        globalWidgetCounts: new Map<string, number>(),
        globalTemplateCounts: new Map<string, number>(),
    };
}

function emptyTabAgg(initialTitle: string, index: number): TabAgg {
    const titleCounts = new Map<string, number>();
    titleCounts.set(initialTitle, 1);
    return {
        titleCounts,
        appearances: 1,
        totalIndex: index,
        fields: new Map<string, FieldAgg>(),
        widgetCounts: new Map<string, number>(),
        templateCounts: new Map<string, number>(),
    };
}

function topHintCounts(
    counts: Map<string, number>,
    total: number,
    limit: number
): PriorHintCount[] {
    return Array.from(counts.entries())
        .sort((a, b) =>
            b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]
        )
        .slice(0, limit)
        .map(([name, occurrences]) => ({
            name,
            occurrences,
            frequency: total > 0 ? toRounded(occurrences / total) : 0,
        }));
}

function resolveDisplayTitle(titleCounts: Map<string, number>): string {
    const [best] = Array.from(titleCounts.entries()).sort((a, b) =>
        b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]
    );
    return best?.[0] ?? 'Untitled Tab';
}

function toFieldPriors(
    fields: Map<string, FieldAgg>,
    support: number
): FieldPrior[] {
    return Array.from(fields.entries())
        .sort((a, b) =>
            b[1].occurrences === a[1].occurrences
                ? a[0].localeCompare(b[0])
                : b[1].occurrences - a[1].occurrences
        )
        .slice(0, 20)
        .map(([fieldPath, stats]) => {
            const sampleType =
                Array.from(stats.types.entries()).sort((a, b) =>
                    b[1] === a[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]
                )[0]?.[0] ?? 'unknown';

            return {
                fieldPath,
                sampleType,
                occurrences: stats.occurrences,
                occurrenceFrequency:
                    support > 0 ? toRounded(stats.occurrences / support) : 0,
                requiredFrequency:
                    support > 0 ? toRounded(stats.requiredCount / support) : 0,
                requiredWhenPresent:
                    stats.occurrences > 0
                        ? toRounded(stats.requiredCount / stats.occurrences)
                        : 0,
            };
        });
}

function toTabPriors(
    tabAggByNormalizedTitle: Map<string, TabAgg>,
    sampleSize: number
): TabPrior[] {
    return Array.from(tabAggByNormalizedTitle.entries())
        .map(([, tabAgg]) => {
            const title = resolveDisplayTitle(tabAgg.titleCounts);
            const occurrences = tabAgg.appearances;
            const averageIndex =
                occurrences > 0
                    ? toRounded(tabAgg.totalIndex / occurrences)
                    : Number.POSITIVE_INFINITY;

            return {
                title,
                occurrences,
                occurrenceRate:
                    sampleSize > 0 ? toRounded(occurrences / sampleSize) : 0,
                averageIndex,
                commonFields: toFieldPriors(tabAgg.fields, occurrences),
                widgetHints: topHintCounts(
                    tabAgg.widgetCounts,
                    occurrences,
                    12
                ),
                templateHints: topHintCounts(
                    tabAgg.templateCounts,
                    occurrences,
                    12
                ),
            };
        })
        .sort((a, b) =>
            a.averageIndex === b.averageIndex
                ? b.occurrences - a.occurrences
                : a.averageIndex - b.averageIndex
        );
}

function toContextPack(
    archetype: TransactionArchetype,
    agg: ArchetypeAgg
): ArchetypeContextPack {
    const tabPriors = toTabPriors(
        agg.tabAggByNormalizedTitle,
        agg.sampleSize
    ).slice(0, 12);

    return {
        archetype,
        sampleSize: agg.sampleSize,
        sourceTaskTypes: Array.from(agg.sourceTaskTypes).sort(),
        commonTabOrder: tabPriors.map((tab) => ({
            title: tab.title,
            occurrenceRate: tab.occurrenceRate,
            averageIndex: tab.averageIndex,
        })),
        tabPriors,
        globalWidgetHints: topHintCounts(
            agg.globalWidgetCounts,
            agg.sampleSize,
            15
        ),
        globalTemplateHints: topHintCounts(
            agg.globalTemplateCounts,
            agg.sampleSize,
            15
        ),
        softPriorRules: [
            'Treat priors as defaults, never strict constraints.',
            'Prefer canonical fields derived from the uploaded form text.',
            'Use historical fields only when canonical signal is weak.',
            'Do not force required=true from priors when source constraints disagree.',
            'Do not force tab order when canonical/tab inference suggests a better flow.',
        ],
    };
}

function emptyContextPack(
    archetype: TransactionArchetype
): ArchetypeContextPack {
    return {
        archetype,
        sampleSize: 0,
        sourceTaskTypes: [],
        commonTabOrder: [],
        tabPriors: [],
        globalWidgetHints: [],
        globalTemplateHints: [],
        softPriorRules: [
            'No historical priors found for this archetype.',
            'Use canonical extraction and tab inference as primary guidance.',
        ],
    };
}

async function buildAllContextPacks(): Promise<
    Record<TransactionArchetype, ArchetypeContextPack>
> {
    const baseAggs = new Map<TransactionArchetype, ArchetypeAgg>();
    for (const archetype of ALL_ARCHETYPES) {
        baseAggs.set(archetype, emptyArchetypeAgg());
    }

    let files: string[] = [];
    try {
        files = await fs.readdir(SCHEMA_DIR);
    } catch {
        const fallback = {} as Record<
            TransactionArchetype,
            ArchetypeContextPack
        >;
        for (const archetype of ALL_ARCHETYPES) {
            fallback[archetype] = emptyContextPack(archetype);
        }
        return fallback;
    }

    const jsonFiles = files.filter((f) => f.toLowerCase().endsWith('.json'));

    for (const fileName of jsonFiles) {
        const absolutePath = path.join(SCHEMA_DIR, fileName);
        let raw = '';
        try {
            raw = await fs.readFile(absolutePath, 'utf-8');
        } catch {
            continue;
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            continue;
        }

        if (!isRecord(parsed)) continue;

        const taskType = asString(parsed.taskType) ?? '';
        const processSubType = asString(parsed.processSubType) ?? '';
        const archetype = inferArchetype(taskType, processSubType, fileName);
        const agg = baseAggs.get(archetype);
        if (!agg) continue;

        agg.sampleSize += 1;
        if (taskType) {
            agg.sourceTaskTypes.add(taskType);
        }

        const schemaContent = isRecord(parsed.schemaContent)
            ? parsed.schemaContent
            : {};
        const tabSchemas = Array.isArray(schemaContent.tabSchemas)
            ? schemaContent.tabSchemas
            : [];

        for (let tabIndex = 0; tabIndex < tabSchemas.length; tabIndex += 1) {
            const tabRaw = tabSchemas[tabIndex];
            if (!isRecord(tabRaw)) continue;
            const title = asString(tabRaw.title) ?? `Tab ${tabIndex + 1}`;
            const normalizedTitle = normalizeTabTitle(title);

            let tabAgg = agg.tabAggByNormalizedTitle.get(normalizedTitle);
            if (!tabAgg) {
                tabAgg = emptyTabAgg(title, tabIndex);
                agg.tabAggByNormalizedTitle.set(normalizedTitle, tabAgg);
            } else {
                tabAgg.appearances += 1;
                tabAgg.totalIndex += tabIndex;
                incrementCount(tabAgg.titleCounts, title);
            }

            const fieldMap = new Map<
                string,
                { required: boolean; type: string }
            >();
            collectFieldStatsFromSchema(tabRaw.formSchema, '', fieldMap);

            for (const [fieldPath, stats] of fieldMap.entries()) {
                const existing = tabAgg.fields.get(fieldPath);
                if (!existing) {
                    const typeMap = new Map<string, number>();
                    incrementCount(typeMap, stats.type);
                    tabAgg.fields.set(fieldPath, {
                        occurrences: 1,
                        requiredCount: stats.required ? 1 : 0,
                        types: typeMap,
                    });
                } else {
                    existing.occurrences += 1;
                    if (stats.required) {
                        existing.requiredCount += 1;
                    }
                    incrementCount(existing.types, stats.type);
                }
            }

            const tabWidgetCounts = new Map<string, number>();
            const tabTemplateCounts = new Map<string, number>();
            collectUiHints(tabRaw.uiSchema, tabWidgetCounts, tabTemplateCounts);

            for (const [name, count] of tabWidgetCounts.entries()) {
                incrementCount(tabAgg.widgetCounts, name, count);
                incrementCount(agg.globalWidgetCounts, name, count);
            }
            for (const [name, count] of tabTemplateCounts.entries()) {
                incrementCount(tabAgg.templateCounts, name, count);
                incrementCount(agg.globalTemplateCounts, name, count);
            }
        }
    }

    const packs = {} as Record<TransactionArchetype, ArchetypeContextPack>;
    for (const archetype of ALL_ARCHETYPES) {
        const agg = baseAggs.get(archetype);
        packs[archetype] = agg
            ? toContextPack(archetype, agg)
            : emptyContextPack(archetype);
    }

    return packs;
}

async function loadPacksWithCache(): Promise<
    Record<TransactionArchetype, ArchetypeContextPack>
> {
    const now = Date.now();
    if (cache && now - cache.loadedAt < CACHE_TTL_MS) {
        return cache.packs;
    }

    const packs = await buildAllContextPacks();
    cache = { loadedAt: now, packs };
    return packs;
}

export async function getArchetypeContextPack(
    archetype: TransactionArchetype
): Promise<ArchetypeContextPack> {
    const packs = await loadPacksWithCache();
    return packs[archetype] ?? emptyContextPack(archetype);
}
