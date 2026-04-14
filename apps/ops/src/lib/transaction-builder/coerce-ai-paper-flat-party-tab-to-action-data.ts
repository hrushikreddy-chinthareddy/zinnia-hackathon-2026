import { keyLooksLikeRepeatablePartyList } from '@deps/lib/transaction-builder/inject-ai-paper-repeatable-array-ui';
import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const RESERVED_ROOT_KEYS = new Set([
    'documents',
    'supportingDocumentAttached',
    'supporting_document_attached',
]);

function tabShouldCoerceFlatFieldsToActionData(title: string): boolean {
    const t = title.toLowerCase();
    if (t.includes('benefic') || t.includes('bénéficiaire')) return false;
    if (/annuitant/.test(t)) return true;
    if (/assignee/.test(t)) return true;
    if (/payee/.test(t)) return true;
    return false;
}

function arrayTitleForTab(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('annuitant')) return 'Annuitant';
    if (t.includes('assignee')) return 'Assignee';
    if (t.includes('payee')) return 'Payee';
    return 'Party';
}

function tabHasPartyListArray(properties: Record<string, unknown>): boolean {
    for (const [key, raw] of Object.entries(properties)) {
        if (!isRecord(raw) || raw.type !== 'array') continue;
        if (key === 'actionData' || keyLooksLikeRepeatablePartyList(key)) {
            return true;
        }
    }
    return false;
}

function migrateUiSchemaForWrappedActionData(
    ui: Record<string, unknown>,
    keysToWrap: string[]
): void {
    const itemsUi: Record<string, unknown> = {};
    for (const k of keysToWrap) {
        if (!isRecord(ui[k])) continue;
        itemsUi[k] = ui[k];
        delete ui[k];
    }
    const existingFieldUi = isRecord(ui.actionData)
        ? (ui.actionData as Record<string, unknown>)
        : {};
    const existingItems = isRecord(existingFieldUi.items)
        ? (existingFieldUi.items as Record<string, unknown>)
        : {};
    ui.actionData = {
        ...existingFieldUi,
        items: { ...existingItems, ...itemsUi },
    };
}

/**
 * LLM tabs often emit a flat "New Annuitant" object. Native tasks model the same
 * data as `actionData: []` with TransactionAccordionTemplate. Wrap flat fields
 * into a single `actionData` array so Add / Remove / party picker match bene flow.
 */
export function coerceFlatPartyTabToActionDataArrayInTabSchemas(
    tabSchemas: FullRjsfOutput['schemaContent']['tabSchemas']
): void {
    for (const tab of tabSchemas) {
        const title = typeof tab.title === 'string' ? tab.title : '';
        if (!tabShouldCoerceFlatFieldsToActionData(title)) continue;

        const formSchema = isRecord(tab.formSchema) ? tab.formSchema : null;
        if (!formSchema || formSchema.type !== 'object') continue;
        const props = isRecord(formSchema.properties)
            ? (formSchema.properties as Record<string, unknown>)
            : {};
        if (!isRecord(tab.uiSchema)) {
            (tab as { uiSchema: Record<string, unknown> }).uiSchema = {};
        }
        const ui = tab.uiSchema as Record<string, unknown>;

        if (props.actionData) continue;
        if (tabHasPartyListArray(props)) continue;

        const keysToWrap = Object.keys(props).filter((k) => {
            if (RESERVED_ROOT_KEYS.has(k)) return false;
            const node = props[k];
            if (!isRecord(node)) return false;
            if (node.type === 'array') return false;
            return true;
        });

        if (keysToWrap.length === 0) continue;

        const newItemProps: Record<string, unknown> = {};
        const newItemRequired: string[] = [];
        for (const k of keysToWrap) {
            newItemProps[k] = props[k];
            delete props[k];
        }

        const rootRequired = Array.isArray(formSchema.required)
            ? ([...formSchema.required] as string[])
            : [];
        for (const k of keysToWrap) {
            if (rootRequired.includes(k)) {
                newItemRequired.push(k);
            }
        }
        const updatedRootRequired = rootRequired.filter(
            (k) => !keysToWrap.includes(k)
        );
        if (!updatedRootRequired.includes('actionData')) {
            updatedRootRequired.push('actionData');
        }
        (formSchema as { required: string[] }).required = updatedRootRequired;

        props.actionData = {
            type: 'array',
            title: arrayTitleForTab(title),
            items: {
                type: 'object',
                properties: newItemProps,
                ...(newItemRequired.length > 0
                    ? { required: newItemRequired }
                    : {}),
            },
        };

        migrateUiSchemaForWrappedActionData(ui, keysToWrap);
    }
}
