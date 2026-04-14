import {
    buildStandardUsAddressObjectSchema,
    buildStandardUsAddressUiSchema,
} from '@deps/constants/us-address-schema-fragment';
import { coerceFlatPartyTabToActionDataArrayInTabSchemas } from '@deps/lib/transaction-builder/coerce-ai-paper-flat-party-tab-to-action-data';
import { injectRepeatablePartyArrayAddUiInTabSchemas } from '@deps/lib/transaction-builder/inject-ai-paper-repeatable-array-ui';
import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';
import { relaxContactValidationsInTabSchemas } from '@deps/lib/transaction-builder/relax-ai-generated-contact-validations';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fieldKeyToMachineKey(key: string): string {
    return key
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');
}

function humanizeFieldKey(fieldKey: string): string {
    return fieldKey
        .replace(/\[\]/g, '')
        .split(/[_\s]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

/**
 * LLMs often emit a single string for “Owner Address”. Expand to a real address object
 * so AddressFieldTemplate (street + ZIP | city | state row) applies.
 */
export function shouldCoerceStringFieldToAddressObject(
    key: string,
    schemaNode: Record<string, unknown>,
    siblingKeys: string[]
): boolean {
    if (schemaNode.type !== 'string') return false;

    const mk = fieldKeyToMachineKey(key);
    const title = (
        typeof schemaNode.title === 'string' ? schemaNode.title : ''
    ).toLowerCase();

    if (mk.includes('email') || mk.includes('ip_address')) return false;

    const looksLikeLine1Only =
        /address_?line|addressline1|street_?1|street1|addr1/.test(mk);
    if (looksLikeLine1Only) return false;

    const labelHasAddress =
        /\baddress\b/.test(title) ||
        mk.includes('address') ||
        mk.endsWith('_addr');

    if (!labelHasAddress) return false;

    const sib = new Set(siblingKeys.map(fieldKeyToMachineKey));
    const hasStructuredNeighbors =
        [...sib].some((k) => k.includes('zip')) &&
        sib.has('city') &&
        sib.has('state');
    if (
        hasStructuredNeighbors &&
        (mk === 'address' || title.trim() === 'address')
    ) {
        return false;
    }

    return true;
}

/** Exported for infer-from-pdf sanitization (tab-level properties + ui). */
export function coerceMonolithicAddressStringFieldsInProperties(
    properties: Record<string, unknown>,
    uiSchema: Record<string, unknown>
): void {
    const keys = Object.keys(properties);

    for (const key of [...keys]) {
        const node = properties[key];
        if (!isRecord(node)) continue;

        if (node.type === 'object' && isRecord(node.properties)) {
            const childUi = isRecord(uiSchema[key])
                ? (uiSchema[key] as Record<string, unknown>)
                : {};
            if (!isRecord(uiSchema[key])) {
                uiSchema[key] = childUi;
            }
            coerceMonolithicAddressStringFieldsInProperties(
                node.properties as Record<string, unknown>,
                childUi
            );
            continue;
        }

        if (node.type === 'array' && isRecord(node.items)) {
            const items = node.items as Record<string, unknown>;
            if (isRecord(items.properties)) {
                const fieldUi = isRecord(uiSchema[key])
                    ? (uiSchema[key] as Record<string, unknown>)
                    : {};
                if (!isRecord(uiSchema[key])) {
                    uiSchema[key] = fieldUi;
                }
                const itemsUi = isRecord(fieldUi.items)
                    ? (fieldUi.items as Record<string, unknown>)
                    : {};
                if (!isRecord(fieldUi.items)) {
                    fieldUi.items = itemsUi;
                }
                coerceMonolithicAddressStringFieldsInProperties(
                    items.properties as Record<string, unknown>,
                    itemsUi
                );
            }
            continue;
        }

        if (shouldCoerceStringFieldToAddressObject(key, node, keys)) {
            const blockTitle =
                typeof node.title === 'string' && node.title.trim()
                    ? node.title
                    : humanizeFieldKey(key);
            properties[key] = buildStandardUsAddressObjectSchema(blockTitle);
            uiSchema[key] = buildStandardUsAddressUiSchema();
        }
    }
}

/** Mutates tabSchemas in place (same object references). */
export function coerceMonolithicAddressFieldsInTabSchemas(
    tabSchemas: FullRjsfOutput['schemaContent']['tabSchemas']
): void {
    for (const tab of tabSchemas) {
        const formSchema = isRecord(tab.formSchema) ? tab.formSchema : null;
        if (!formSchema || formSchema.type !== 'object') continue;
        const props = isRecord(formSchema.properties)
            ? formSchema.properties
            : {};
        const ui = isRecord(tab.uiSchema) ? tab.uiSchema : {};
        if (!isRecord(tab.uiSchema)) {
            (tab as { uiSchema: Record<string, unknown> }).uiSchema = ui;
        }
        coerceMonolithicAddressStringFieldsInProperties(props, ui);
    }
}

export function coerceFullRjsfOutputMonolithicAddresses(
    output: FullRjsfOutput
): FullRjsfOutput {
    const next = JSON.parse(JSON.stringify(output)) as FullRjsfOutput;
    coerceFlatPartyTabToActionDataArrayInTabSchemas(
        next.schemaContent.tabSchemas
    );
    coerceMonolithicAddressFieldsInTabSchemas(next.schemaContent.tabSchemas);
    relaxContactValidationsInTabSchemas(next.schemaContent.tabSchemas);
    injectRepeatablePartyArrayAddUiInTabSchemas(next.schemaContent.tabSchemas);
    return next;
}
