/**
 * TransactionAccordionTemplate hides the Add button when both
 * `isSinglePartyTransaction` and `isMultiPartyTransaction` are false ("simple"
 * accordion). Real bene tasks set `isMultiPartyTransaction: true`. LLM output
 * often omits that, so users see Primary/Contingent rows with no Add control.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function tabLooksLikePartyLists(tabTitle: string): boolean {
    const t = tabTitle.toLowerCase();
    return /benefic|bénéficiaire|payee|assignee|annuitant|party|owner|insured/i.test(
        t
    );
}

export function keyLooksLikeRepeatablePartyList(key: string): boolean {
    const k = key.toLowerCase();
    return /benefic|bene|primary|contingent|payee|assignee|annuitant|party|insured/i.test(
        k
    );
}

function ensureArrayUiOptionsForAdd(opts: Record<string, unknown>): void {
    if (opts.isSinglePartyTransaction === true) {
        return;
    }
    opts.isMultiPartyTransaction = true;
    if (opts.showAddBtn === undefined) {
        opts.showAddBtn = true;
    }
    if (opts.addable === undefined) {
        opts.addable = true;
    }
    if (opts.showRemoveItemBtn === undefined) {
        opts.showRemoveItemBtn = true;
    }
    if (typeof opts.addButtonCTA !== 'string' || !opts.addButtonCTA.trim()) {
        opts.addButtonCTA = 'Add';
    }
    const tmpl = opts.ArrayFieldTemplate;
    if (tmpl !== 'TransactionAccordionTemplate') {
        opts.ArrayFieldTemplate = 'TransactionAccordionTemplate';
    }
}

export function injectRepeatablePartyArrayAddUiInProperties(
    properties: Record<string, unknown>,
    uiSchema: Record<string, unknown>,
    tabTitle: string
): void {
    const tabHint = tabLooksLikePartyLists(tabTitle);

    for (const [key, raw] of Object.entries(properties)) {
        if (!isRecord(raw) || raw.type !== 'array') continue;
        if (!tabHint && !keyLooksLikeRepeatablePartyList(key)) continue;

        if (!isRecord(uiSchema[key])) {
            uiSchema[key] = {};
        }
        const fieldUi = uiSchema[key] as Record<string, unknown>;
        const opts = isRecord(fieldUi['ui:options'])
            ? (fieldUi['ui:options'] as Record<string, unknown>)
            : {};
        if (!isRecord(fieldUi['ui:options'])) {
            fieldUi['ui:options'] = opts;
        }
        ensureArrayUiOptionsForAdd(opts);
    }
}

export function injectRepeatablePartyArrayAddUiInTabSchemas(
    tabSchemas: Array<{
        title: string;
        formSchema?: unknown;
        uiSchema?: unknown;
    }>
): void {
    for (const tab of tabSchemas) {
        const formSchema = isRecord(tab.formSchema) ? tab.formSchema : null;
        if (!formSchema || formSchema.type !== 'object') continue;
        const props = isRecord(formSchema.properties)
            ? (formSchema.properties as Record<string, unknown>)
            : {};
        if (!isRecord(tab.uiSchema)) {
            (tab as { uiSchema: Record<string, unknown> }).uiSchema = {};
        }
        const ui = tab.uiSchema as Record<string, unknown>;
        injectRepeatablePartyArrayAddUiInProperties(
            props,
            ui,
            typeof tab.title === 'string' ? tab.title : ''
        );
    }
}
