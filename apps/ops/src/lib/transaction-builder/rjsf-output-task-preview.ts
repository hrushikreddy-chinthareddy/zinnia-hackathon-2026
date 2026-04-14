import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';
import type { FormMetadata } from '@deps/models/case/task';
import {
    TaskStatus,
    type ManagementTask,
} from '@deps/models/case/task-instance';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeTitle(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Tabs excluded from self-serve / policy People AI flows (and seeding). */
export function shouldIncludeTabInSelfServeFlow(tabTitle: string): boolean {
    const n = normalizeTitle(tabTitle);
    if (n === 'confirm') return false;
    if (n === 'review form data') return false;
    return true;
}

export function filterTabSchemasForSelfServe<T extends { title: string }>(
    tabSchemas: T[]
): T[] {
    return tabSchemas.filter((tab) =>
        shouldIncludeTabInSelfServeFlow(tab.title)
    );
}

type TabWithOptionalId = { title: string; id?: string };

/**
 * Must match `infer-from-pdf` tab ids: use API `tab.id` when present, else a stable fallback.
 */
export function tabStorageKey(tab: TabWithOptionalId, index: number): string {
    if (typeof tab.id === 'string' && tab.id.trim().length > 0) {
        return tab.id.trim();
    }
    const slug = normalizeTitle(tab.title)
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    return `tab_${index}_${slug || 'sheet'}`;
}

function seedSingleTabFormData(tab: {
    formSchema?: unknown;
}): Record<string, unknown> {
    const seeded: Record<string, unknown> = {};
    const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
    const properties = isRecord(formSchema.properties)
        ? formSchema.properties
        : {};

    for (const [fieldKey, propertySchema] of Object.entries(properties)) {
        if (!isRecord(propertySchema)) {
            continue;
        }

        const type =
            typeof propertySchema.type === 'string' ? propertySchema.type : '';
        if (Object.prototype.hasOwnProperty.call(propertySchema, 'default')) {
            seeded[fieldKey] = propertySchema.default;
            continue;
        }

        if (type === 'array') {
            const itemsSchema = isRecord(propertySchema.items)
                ? propertySchema.items
                : null;
            if (
                itemsSchema &&
                (itemsSchema.type === 'object' ||
                    isRecord(itemsSchema.properties))
            ) {
                const minItems =
                    typeof propertySchema.minItems === 'number' &&
                    Number.isFinite(propertySchema.minItems)
                        ? Math.max(0, Math.floor(propertySchema.minItems))
                        : 0;
                const rowCount = Math.max(1, minItems);
                seeded[fieldKey] = Array.from({ length: rowCount }, () =>
                    buildObjectTemplateFromSchema(itemsSchema)
                );
            } else if (
                typeof propertySchema.minItems === 'number' &&
                Number.isFinite(propertySchema.minItems) &&
                propertySchema.minItems > 0
            ) {
                seeded[fieldKey] = Array.from(
                    { length: Math.floor(propertySchema.minItems) },
                    () => undefined
                );
            } else {
                seeded[fieldKey] = [];
            }
            continue;
        }

        if (type === 'object') {
            seeded[fieldKey] = buildObjectTemplateFromSchema(propertySchema);
        } else {
            seeded[fieldKey] = undefined;
        }
    }

    return seeded;
}

/** Per-tab form slices for `generatedFormData` (AI paper self-serve hydration). */
export function seedGeneratedFormDataFromOutput(
    output: FullRjsfOutput
): Record<string, Record<string, unknown>> {
    const out: Record<string, Record<string, unknown>> = {};
    const tabs = filterTabSchemasForSelfServe(output.schemaContent.tabSchemas);
    tabs.forEach((tab, index) => {
        const key = tabStorageKey(tab as TabWithOptionalId, index);
        out[key] = seedSingleTabFormData(tab);
    });
    return out;
}

export function fullRjsfOutputToTaskMetadata(
    output: FullRjsfOutput
): FormMetadata[] {
    return filterTabSchemasForSelfServe(output.schemaContent.tabSchemas).map(
        (tab, index) => ({
            id: tabStorageKey(tab as TabWithOptionalId, index),
            title: tab.title,
            formSchema: isRecord(tab.formSchema)
                ? tab.formSchema
                : { type: 'object', properties: {} },
            uiSchema: isRecord(tab.uiSchema)
                ? tab.uiSchema
                : { 'ui:submitButtonOptions': { norender: true } },
        })
    );
}

function buildObjectTemplateFromSchema(
    schema: unknown
): Record<string, unknown> {
    if (!isRecord(schema)) return {};
    const properties = isRecord(schema.properties) ? schema.properties : {};
    const out: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
        if (!isRecord(value)) {
            out[key] = undefined;
            continue;
        }
        const type = typeof value.type === 'string' ? value.type : '';
        if (Object.prototype.hasOwnProperty.call(value, 'default')) {
            out[key] = value.default;
            continue;
        }
        if (type === 'object') {
            out[key] = buildObjectTemplateFromSchema(value);
            continue;
        }
        if (type === 'array') {
            out[key] = [];
            continue;
        }
        out[key] = undefined;
    }

    return out;
}

export function seedPreviewTaskDataFromOutput(
    output: FullRjsfOutput
): Record<string, unknown> {
    const seeded: Record<string, unknown> = {};

    for (const tab of filterTabSchemasForSelfServe(
        output.schemaContent.tabSchemas
    )) {
        const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
        const properties = isRecord(formSchema.properties)
            ? formSchema.properties
            : {};

        for (const [fieldKey, propertySchema] of Object.entries(properties)) {
            if (Object.prototype.hasOwnProperty.call(seeded, fieldKey)) {
                continue;
            }
            if (!isRecord(propertySchema)) {
                continue;
            }

            const type =
                typeof propertySchema.type === 'string'
                    ? propertySchema.type
                    : '';
            if (
                Object.prototype.hasOwnProperty.call(propertySchema, 'default')
            ) {
                seeded[fieldKey] = propertySchema.default;
                continue;
            }

            if (type === 'array') {
                const itemsSchema = isRecord(propertySchema.items)
                    ? propertySchema.items
                    : null;
                if (
                    itemsSchema &&
                    (itemsSchema.type === 'object' ||
                        isRecord(itemsSchema.properties))
                ) {
                    const minItems =
                        typeof propertySchema.minItems === 'number' &&
                        Number.isFinite(propertySchema.minItems)
                            ? Math.max(0, Math.floor(propertySchema.minItems))
                            : 0;
                    const rowCount = Math.max(1, minItems);
                    seeded[fieldKey] = Array.from({ length: rowCount }, () =>
                        buildObjectTemplateFromSchema(itemsSchema)
                    );
                } else if (
                    typeof propertySchema.minItems === 'number' &&
                    Number.isFinite(propertySchema.minItems) &&
                    propertySchema.minItems > 0
                ) {
                    seeded[fieldKey] = Array.from(
                        { length: Math.floor(propertySchema.minItems) },
                        () => undefined
                    );
                } else {
                    seeded[fieldKey] = [];
                }
                continue;
            }

            if (type === 'object') {
                seeded[fieldKey] =
                    buildObjectTemplateFromSchema(propertySchema);
            } else {
                seeded[fieldKey] = undefined;
            }
        }
    }

    return seeded;
}

export function buildMockManagementTaskFromRjsfOutput(
    output: FullRjsfOutput
): ManagementTask {
    const now = new Date().toISOString();

    return {
        id: `mock-task-${Date.now()}`,
        caseId: 'MOCK-CASE-001',
        carrier: 'FNWL',
        createdAt: now,
        updatedAt: now,
        process: output.process || 'Policy Update',
        status: TaskStatus.Open,
        taskName: output.processSubType || 'Generated Paper Flow Preview',
        taskType: 'AI_PAPER_PREVIEW_TASK',
        queue: 'MOCK_QUEUE',
        data: seedPreviewTaskDataFromOutput(output),
        mappedDocuments: [],
        assigneePartyId: 'mock-assignee',
    };
}

export function buildRjsfPreviewDebugSummary(output: FullRjsfOutput): {
    createdFromTaskType: string;
    tabTitles: string[];
    transactionTabFields: string[];
} {
    const tabs = output.schemaContent.tabSchemas;
    const transactionTab =
        tabs.find((tab) => normalizeTitle(tab.title).includes('beneficiary')) ??
        tabs[1];
    const formSchema =
        transactionTab && isRecord(transactionTab.formSchema)
            ? transactionTab.formSchema
            : {};
    const properties = isRecord(formSchema.properties)
        ? formSchema.properties
        : {};

    return {
        createdFromTaskType: output.taskType,
        tabTitles: tabs.map((tab) => tab.title),
        transactionTabFields: Object.keys(properties),
    };
}
