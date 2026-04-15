/**
 * LLMs and canonical hints often emit strict SSN / US-phone regexes that reject
 * real SOR values (masked SSN, +1 display phones). Normalize those patterns
 * after generation and when loading stored FullRjsfOutput.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Unmasked XXX-XX-XXXX or masked ***-**-1234 / similar bullet/X masks. */
export const AI_PAPER_TOLERANT_SSN_PATTERN =
    '^(?:\\d{3}-?\\d{2}-?\\d{4}|[*•xX#]{3}-[*•xX#]{2}-\\d{4})$';

/** E.164-ish and common US formatting from policy APIs (spaces, parens). */
export const AI_PAPER_TOLERANT_PHONE_PATTERN = '^[+\\d\\s().\\-]{10,24}$';

function schemaIncludesString(schemaNode: Record<string, unknown>): boolean {
    const t = schemaNode.type;
    if (t === 'string') return true;
    if (Array.isArray(t) && t.some((x) => x === 'string')) return true;
    return false;
}

function looksLikeTaxIdField(propKey: string, title: string): boolean {
    const c = `${propKey} ${title}`.toLowerCase();
    if (/employer/.test(c)) return false;
    return /(ssn|social security|tax id|taxid|\bitin\b|\btin\b)/.test(c);
}

function looksLikePhoneField(propKey: string, title: string): boolean {
    const c = `${propKey} ${title}`.toLowerCase();
    return (
        /(phone|telephone|mobile|cell)/.test(c) ||
        (/fax/.test(c) && !/employer/.test(c)) ||
        /\bdial|dialnumber|dial_number|countrycode|area_code|areacode/.test(c)
    );
}

function relaxStringFieldValidation(
    propKey: string,
    schemaNode: Record<string, unknown>
): void {
    if (!schemaIncludesString(schemaNode)) return;
    const title = typeof schemaNode.title === 'string' ? schemaNode.title : '';

    if (looksLikeTaxIdField(propKey, title)) {
        schemaNode.pattern = AI_PAPER_TOLERANT_SSN_PATTERN;
        const ml = schemaNode.maxLength;
        if (typeof ml === 'number' && ml < 15) {
            schemaNode.maxLength = 15;
        }
        return;
    }

    if (looksLikePhoneField(propKey, title)) {
        delete schemaNode.pattern;
        delete schemaNode.minLength;
        delete schemaNode.maxLength;
    }
}

export function relaxContactValidationsInProperties(
    properties: Record<string, unknown>
): void {
    for (const [key, raw] of Object.entries(properties)) {
        if (!isRecord(raw)) continue;

        if (raw.type === 'object' && isRecord(raw.properties)) {
            relaxContactValidationsInProperties(
                raw.properties as Record<string, unknown>
            );
            continue;
        }

        if (raw.type === 'array' && isRecord(raw.items)) {
            const items = raw.items as Record<string, unknown>;
            if (isRecord(items.properties)) {
                relaxContactValidationsInProperties(
                    items.properties as Record<string, unknown>
                );
            }
        }

        relaxStringFieldValidation(key, raw);
    }
}

export function relaxContactValidationsInTabSchemas(
    tabSchemas: Array<{ formSchema?: unknown }>
): void {
    for (const tab of tabSchemas) {
        const fs = tab.formSchema;
        if (!isRecord(fs) || !isRecord(fs.properties)) continue;
        relaxContactValidationsInProperties(
            fs.properties as Record<string, unknown>
        );
    }
}
