import { formatAnnuitants } from '@deps/containers/task-container/task-handlers/tasks/initiate-annuitantchange-transaction';
import { formatPartyData as formatAssigneePartyData } from '@deps/containers/task-container/task-handlers/tasks/initiate-assigneechange-transaction';
import { formatBeneficiaries } from '@deps/containers/task-container/task-handlers/tasks/initiate-benechange-transaction';
import { formatPartyData as formatPayeePartyData } from '@deps/containers/task-container/task-handlers/tasks/payeechange-data-entry';
import {
    PartyRoleType,
    PolicyResponse,
} from '@deps/containers/task-container/task-handlers/types';
import { isEndDated } from '@deps/helpers/date.helpers';
import { contextHintsPartyRole } from '@deps/lib/transaction-builder/ai-paper-policy-tab-gates';
import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';
import {
    filterTabSchemasForSelfServe,
    tabStorageKey,
} from '@deps/lib/transaction-builder/rjsf-output-task-preview';
import { IdentificationType, PartyType } from '@deps/models/policy/sor-policy';
import { Party, PartyRole, Policy } from '@zinnia/api-types/types/sor';

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMergeFormPrefill(
    seed: Record<string, unknown>,
    prefill: Record<string, unknown>
): Record<string, unknown> {
    const out: Record<string, unknown> = { ...seed };
    for (const [key, val] of Object.entries(prefill)) {
        if (isPlainObject(val) && isPlainObject(out[key])) {
            out[key] = deepMergeFormPrefill(
                out[key] as Record<string, unknown>,
                val
            );
        } else {
            out[key] = val;
        }
    }
    return out;
}

function partyDisplayName(party: Party): string {
    if (
        party.partyType === PartyType.ORGANIZATION ||
        party.partyType === PartyType.TRUST
    ) {
        return (party.fullName ?? '').trim();
    }
    const parts = [party.firstName, party.middleName, party.lastName].filter(
        Boolean
    );
    if (parts.length > 0) {
        return parts.join(' ').trim();
    }
    return (party.fullName ?? '').trim();
}

function activeRolePartyId(
    policy: Policy,
    role: PartyRole | PartyRoleType
): string | undefined {
    const id = policy.partyRoles?.find(
        (r) =>
            r.partyRole === role &&
            (!r.endDate || !isEndDated(r.endDate as string))
    )?.partyId;
    return id ?? undefined;
}

/** Insured if present, else annuitant, else owner — matches paper “insured / annuitant” headers. */
export function getInsuredOrOwnerDisplayName(policy: Policy): string {
    const insuredId = activeRolePartyId(policy, PartyRole.INSURED);
    if (insuredId) {
        const p = policy.parties?.find((x) => x.partyId === insuredId);
        if (p) return partyDisplayName(p);
    }
    const annuitantId = activeRolePartyId(policy, PartyRoleType.ANNUITANT);
    if (annuitantId) {
        const p = policy.parties?.find((x) => x.partyId === annuitantId);
        if (p) return partyDisplayName(p);
    }
    const ownerId = activeRolePartyId(policy, PartyRole.OWNER);
    if (ownerId) {
        const p = policy.parties?.find((x) => x.partyId === ownerId);
        if (p) return partyDisplayName(p);
    }
    return '';
}

function matchesInsuredNameField(context: string): boolean {
    if (contextHintsPartyRole(context) != null) return false;
    if (/name of (the )?(insured|annuitant)/.test(context)) return true;
    if (/(insured|annuitant).*(name|full name)/.test(context)) return true;
    if (/(name|full name).*(insured|annuitant)/.test(context)) return true;
    // Avoid matching "joint_owner_full_name" / "Joint Owner Full Name" via a generic "owner … name".
    if (/(?<!\w)owner(?!\w).*(name|full name)/.test(context)) return true;
    return false;
}

function matchesPolicyNumberField(context: string): boolean {
    if (/(policy|contract).*(number|no\.?|#)/.test(context)) return true;
    if (/(number).*(policy|contract)/.test(context)) return true;
    return false;
}

/**
 * Party fields on “contract / owner / insured” tabs — not beneficiary rows and
 * not labels that name another party role (joint owner, payee, assignee, …).
 */
function isPartyScopeForAiPrefill(propKey: string, title: string): boolean {
    const c = `${propKey} ${title}`.toLowerCase();
    if (c.includes('benefic')) return false;
    if (c.includes('contingent')) return false;
    if (contextHintsPartyRole(c) != null) return false;
    return true;
}

function matchesTaxIdField(context: string): boolean {
    return (
        /(ssn|social security|tax id|taxid|itin|tin\b)/.test(context) &&
        !/employer/.test(context)
    );
}

function matchesPhoneField(context: string): boolean {
    return (
        /(phone|telephone|mobile|cell)/.test(context) ||
        /\bdial|dialnumber|dial_number|countrycode|area_code|areacode/.test(
            context
        )
    );
}

function matchesEmailField(context: string): boolean {
    return /(email|e-mail)/.test(context);
}

function isStructuredUsAddressObject(
    propSchema: Record<string, unknown>
): boolean {
    const props = isRecord(propSchema.properties) ? propSchema.properties : {};
    const keys = Object.keys(props).map((k) => k.toLowerCase());
    const hasZip = keys.some((k) => k.includes('zip') || k.includes('postal'));
    const hasCity = keys.some((k) => k === 'city');
    const hasState = keys.some((k) => k.includes('state'));
    return hasZip && hasCity && hasState;
}

function isAddressLikeBlock(
    propKey: string,
    title: string,
    propSchema: Record<string, unknown>
): boolean {
    const k = propKey.toLowerCase();
    const t = title.toLowerCase();
    if (k.includes('email') || t.includes('email')) return false;
    if (!isStructuredUsAddressObject(propSchema)) return false;
    if (/\baddress\b/.test(t) || k.includes('address')) return true;
    return false;
}

function getInsuredOrOwnerParty(policy: Policy): Party | null {
    const insuredId = activeRolePartyId(policy, PartyRole.INSURED);
    if (insuredId) {
        const p = policy.parties?.find((x) => x.partyId === insuredId);
        if (p) return p;
    }
    const annuitantId = activeRolePartyId(policy, PartyRoleType.ANNUITANT);
    if (annuitantId) {
        const p = policy.parties?.find((x) => x.partyId === annuitantId);
        if (p) return p;
    }
    const ownerId = activeRolePartyId(policy, PartyRole.OWNER);
    if (ownerId) {
        const p = policy.parties?.find((x) => x.partyId === ownerId);
        if (p) return p;
    }
    return null;
}

function phoneDigitsOnly(value: string): string {
    return value.replace(/\D/g, '');
}

/**
 * NumbersWidget stores and validates digit-only values, then formats for display.
 * Prefilling a hyphenated local dial (e.g. "555-0128") becomes 7 digits and is
 * mis-read as a partial +country number (+5 (550) 128). Always pass full NANP
 * digits (e.g. 15125550128) when country/area are present.
 */
function extractPrimaryPhoneDisplay(party: Record<string, unknown>): string {
    const phones = party.phones;
    if (!Array.isArray(phones) || phones.length === 0) return '';
    let chosen: Record<string, unknown> | null = null;
    for (const raw of phones) {
        if (isRecord(raw) && raw.isPreferred) {
            chosen = raw;
            break;
        }
    }
    const p = chosen ?? (isRecord(phones[0]) ? phones[0] : null);
    if (!p) return '';

    const ccRaw =
        p.countryCode != null && p.countryCode !== ''
            ? String(p.countryCode)
            : '';
    const acRaw = typeof p.areaCode === 'string' ? p.areaCode : '';
    const dialRaw =
        typeof p.dialNumber === 'string' && p.dialNumber.trim()
            ? p.dialNumber.trim()
            : '';
    const numFallback =
        (typeof p.phoneNumber === 'string' && p.phoneNumber) ||
        (typeof p.number === 'string' && p.number) ||
        '';

    const cc = phoneDigitsOnly(ccRaw);
    const ac = phoneDigitsOnly(acRaw);
    let dialDigits = phoneDigitsOnly(dialRaw);
    const fallbackDigits = phoneDigitsOnly(numFallback);

    if (!dialDigits && fallbackDigits) {
        dialDigits = fallbackDigits;
    }
    if (!dialDigits) {
        return '';
    }

    // Already a full national/international digit string in dialNumber only
    if (!ac && !cc && dialDigits.length >= 10) {
        return dialDigits.length === 10 ? `1${dialDigits}` : dialDigits;
    }

    let combined = `${cc}${ac}${dialDigits}`;

    if (ac && dialDigits.length >= 10 && dialDigits.startsWith(ac)) {
        combined = `${cc}${dialDigits}`;
    }

    if (!cc && combined.length === 10) {
        combined = `1${combined}`;
    }

    return combined;
}

function extractPrimaryEmailAddress(party: Record<string, unknown>): string {
    const emails = party.emails;
    if (!Array.isArray(emails) || emails.length === 0) return '';
    let chosen: Record<string, unknown> | null = null;
    for (const raw of emails) {
        if (isRecord(raw) && raw.isPreferred) {
            chosen = raw;
            break;
        }
    }
    const e = chosen ?? (isRecord(emails[0]) ? emails[0] : null);
    if (!e) return '';
    const addr = e.emailAddress;
    return typeof addr === 'string' ? addr.trim() : '';
}

function mapResidenceAddressOntoAddressSchema(
    addr: Record<string, unknown>,
    propSchema: Record<string, unknown>,
    existing: Record<string, unknown>
): Record<string, unknown> {
    const out = { ...existing };
    const props = isRecord(propSchema.properties) ? propSchema.properties : {};
    for (const [sk, sVal] of Object.entries(props)) {
        if (!isRecord(sVal)) continue;
        const lk = sk.toLowerCase();
        let raw: unknown;
        if (lk.includes('line1') || lk === 'street1' || lk === 'addr1')
            raw = addr.addressLine1 ?? addr.line1 ?? addr.street1;
        else if (lk.includes('line2')) raw = addr.addressLine2 ?? addr.line2;
        else if (lk === 'city') raw = addr.city;
        else if (lk === 'state' || lk.includes('region'))
            raw = addr.state ?? addr.stateCode;
        else if (lk.includes('zip') || lk.includes('postal'))
            raw = addr.zipCode ?? addr.postalCode ?? addr.zip;
        else if (lk.includes('country')) {
            raw = addr.country;
            if (raw === 'US' || raw === 'Us') raw = 'USA';
        }
        if (raw != null && raw !== '') {
            out[sk] = typeof raw === 'string' ? raw : String(raw);
        }
    }
    return out;
}

function applyPartyDetailPrefillToNode(
    party: Record<string, unknown>,
    node: Record<string, unknown>,
    propKey: string,
    propSchema: Record<string, unknown>
): void {
    const title = typeof propSchema.title === 'string' ? propSchema.title : '';
    if (!isPartyScopeForAiPrefill(propKey, title)) {
        return;
    }

    const type =
        typeof propSchema.type === 'string' ? propSchema.type : undefined;
    const context = `${propKey} ${title}`.toLowerCase();

    if (type === 'array' && isRecord(propSchema.items)) {
        const itemsSchema = propSchema.items as Record<string, unknown>;
        const itemsType =
            typeof itemsSchema.type === 'string' ? itemsSchema.type : '';
        if (itemsType === 'object' && isRecord(itemsSchema.properties)) {
            let arr = node[propKey];
            if (!Array.isArray(arr) || arr.length === 0) {
                arr = [{}];
                node[propKey] = arr;
            }
            for (const raw of arr) {
                if (!isPlainObject(raw)) continue;
                const el = raw as Record<string, unknown>;
                for (const [ik, ischema] of Object.entries(
                    itemsSchema.properties
                )) {
                    if (isRecord(ischema)) {
                        applyPartyDetailPrefillToNode(party, el, ik, ischema);
                    }
                }
            }
        }
        return;
    }

    if (
        type === 'array' ||
        type === 'boolean' ||
        type === 'number' ||
        type === 'integer'
    ) {
        return;
    }

    if (type === 'object' && isRecord(propSchema.properties)) {
        if (isAddressLikeBlock(propKey, title, propSchema)) {
            const addr = pickResidenceAddress(party);
            if (addr) {
                const existing = isPlainObject(node[propKey])
                    ? { ...(node[propKey] as Record<string, unknown>) }
                    : {};
                node[propKey] = mapResidenceAddressOntoAddressSchema(
                    addr,
                    propSchema,
                    existing
                );
            }
            return;
        }
        if (!isPlainObject(node[propKey])) {
            node[propKey] = {};
        }
        const child = node[propKey] as Record<string, unknown>;
        for (const [ck, cschema] of Object.entries(propSchema.properties)) {
            if (isRecord(cschema)) {
                applyPartyDetailPrefillToNode(party, child, ck, cschema);
            }
        }
        return;
    }

    const current = node[propKey];
    const isEmpty =
        current == null ||
        current === '' ||
        (typeof current === 'string' && current.trim() === '');

    if (matchesTaxIdField(context) && isEmpty) {
        const ssn = extractTaxIdFromParty(party);
        if (ssn) node[propKey] = ssn;
        return;
    }
    if (matchesPhoneField(context) && isEmpty) {
        const phone = extractPrimaryPhoneDisplay(party);
        if (phone) node[propKey] = phone;
        return;
    }
    if (matchesEmailField(context) && isEmpty) {
        const email = extractPrimaryEmailAddress(party);
        if (email) node[propKey] = email;
    }
}

function applyPartyDetailPrefillForSingleTab(
    policy: Policy,
    tab: { formSchema?: unknown },
    formData: Record<string, unknown>
): void {
    const party = getInsuredOrOwnerParty(policy);
    if (!party) return;
    const asRecord = party as unknown as Record<string, unknown>;

    const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
    const properties = isRecord(formSchema.properties)
        ? formSchema.properties
        : {};
    for (const [key, schema] of Object.entries(properties)) {
        if (isRecord(schema)) {
            applyPartyDetailPrefillToNode(asRecord, formData, key, schema);
        }
    }
}

function applySemanticStringPrefillToNode(
    insuredName: string,
    policyNumber: string,
    node: Record<string, unknown>,
    propKey: string,
    propSchema: Record<string, unknown>
): void {
    const title = typeof propSchema.title === 'string' ? propSchema.title : '';
    const context = `${propKey} ${title}`.toLowerCase();
    const type =
        typeof propSchema.type === 'string' ? propSchema.type : undefined;

    if (type === 'object' && isRecord(propSchema.properties)) {
        const existing = node[propKey];
        if (typeof existing === 'string' && existing.trim()) {
            node[propKey] = { addressLine1: existing.trim() };
        } else if (!isPlainObject(node[propKey])) {
            node[propKey] = {};
        }
        const child = node[propKey] as Record<string, unknown>;
        for (const [ck, cschema] of Object.entries(propSchema.properties)) {
            if (isRecord(cschema)) {
                applySemanticStringPrefillToNode(
                    insuredName,
                    policyNumber,
                    child,
                    ck,
                    cschema
                );
            }
        }
        return;
    }

    if (type === 'array' && isRecord(propSchema.items)) {
        const itemsSchema = propSchema.items as Record<string, unknown>;
        const itemsType =
            typeof itemsSchema.type === 'string' ? itemsSchema.type : '';
        if (itemsType === 'object' && isRecord(itemsSchema.properties)) {
            let arr = node[propKey];
            if (!Array.isArray(arr) || arr.length === 0) {
                arr = [{}];
                node[propKey] = arr;
            }
            for (const raw of arr) {
                if (!isPlainObject(raw)) continue;
                const el = raw as Record<string, unknown>;
                for (const [ik, ischema] of Object.entries(
                    itemsSchema.properties
                )) {
                    if (isRecord(ischema)) {
                        applySemanticStringPrefillToNode(
                            insuredName,
                            policyNumber,
                            el,
                            ik,
                            ischema
                        );
                    }
                }
            }
        }
        return;
    }

    if (type === 'array' || type === 'boolean' || type === 'number') {
        return;
    }

    if (matchesInsuredNameField(context) && insuredName) {
        node[propKey] = insuredName;
        return;
    }
    if (matchesPolicyNumberField(context) && policyNumber) {
        node[propKey] = policyNumber;
    }
}

function applySemanticFlatPrefillForSingleTab(
    policy: Policy,
    tab: { formSchema?: unknown },
    formData: Record<string, unknown>
): void {
    const insuredName = getInsuredOrOwnerDisplayName(policy);
    const policyNumber = policy.policyNumber ?? '';

    const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
    const properties = isRecord(formSchema.properties)
        ? formSchema.properties
        : {};
    for (const [key, schema] of Object.entries(properties)) {
        if (isRecord(schema)) {
            applySemanticStringPrefillToNode(
                insuredName,
                policyNumber,
                formData,
                key,
                schema
            );
        }
    }
}

function composePartyLegalName(party: Record<string, unknown>): string {
    const fn = party.firstName;
    const mn = party.middleName;
    const ln = party.lastName;
    const parts = [fn, mn, ln].filter(
        (x) => typeof x === 'string' && x.trim().length > 0
    );
    if (parts.length > 0) return parts.join(' ').trim();
    const full = party.fullName;
    return typeof full === 'string' ? full.trim() : '';
}

function pickResidenceAddress(
    party: Record<string, unknown>
): Record<string, unknown> | null {
    const addrs = party.addresses;
    if (!Array.isArray(addrs) || addrs.length === 0) return null;
    const upper = (v: unknown) =>
        typeof v === 'string' ? v.toUpperCase() : '';
    const residence = addrs.find(
        (a) =>
            isRecord(a) &&
            (upper(a.addressType).includes('RESIDENCE') ||
                upper(a.addressType) === 'RESIDENTIAL')
    );
    const first = residence ?? addrs[0];
    return isRecord(first) ? first : null;
}

function extractTaxIdFromParty(party: Record<string, unknown>): string {
    const ids = party.identifications;
    if (!Array.isArray(ids)) return '';
    for (const raw of ids) {
        if (!isRecord(raw)) continue;
        const t = String(raw.identificationType ?? '').toUpperCase();
        if (
            t === IdentificationType.SSN ||
            t === IdentificationType.TIN ||
            t.includes('SSN') ||
            t.includes('TIN')
        ) {
            const v = raw.identificationValue;
            return typeof v === 'string' ? v : '';
        }
    }
    return '';
}

/**
 * Maps live bene task row (`party`, `partyRole`, …) onto AI-generated array item keys
 * like `full_legal_name`, `relationship_to_insured`, nested `address`, etc.
 * A plain deep-merge leaves schema keys empty because SOR data is nested under `party`.
 */
function projectBeneRowOntoItemSchema(
    seedItem: Record<string, unknown>,
    beneRow: Record<string, unknown>,
    itemsSchema: Record<string, unknown>
): Record<string, unknown> {
    const party = isRecord(beneRow.party)
        ? (beneRow.party as Record<string, unknown>)
        : {};
    const partyRole = isRecord(beneRow.partyRole)
        ? (beneRow.partyRole as Record<string, unknown>)
        : {};

    const props = isRecord(itemsSchema.properties)
        ? itemsSchema.properties
        : {};
    const projection: Record<string, unknown> = {};
    const addr = pickResidenceAddress(party);

    for (const [propKey, propSchema] of Object.entries(props)) {
        if (!isRecord(propSchema)) continue;
        const pk = propKey.toLowerCase();
        const type = propSchema.type;

        if (type === 'object' && isRecord(propSchema.properties)) {
            const nestedSeed = isRecord(seedItem[propKey])
                ? { ...(seedItem[propKey] as Record<string, unknown>) }
                : {};
            const nestedOut: Record<string, unknown> = { ...nestedSeed };
            if (pk.includes('address') && addr) {
                for (const ak of Object.keys(propSchema.properties)) {
                    const v = addr[ak];
                    if (v != null && v !== '') {
                        nestedOut[ak] = v;
                    }
                }
            }
            projection[propKey] = nestedOut;
            continue;
        }

        const legalNameMatch =
            (pk.includes('legal') && pk.includes('name')) ||
            pk === 'full_legal_name' ||
            pk === 'beneficiary_name' ||
            (pk.includes('full') &&
                pk.includes('name') &&
                !pk.includes('first'));

        if (legalNameMatch) {
            const name =
                typeof party.fullName === 'string' && party.fullName.trim()
                    ? String(party.fullName).trim()
                    : composePartyLegalName(party);
            if (name) projection[propKey] = name;
            continue;
        }

        if (
            (pk.includes('relationship') && pk.includes('insured')) ||
            pk === 'relationship_to_insured'
        ) {
            const rel = partyRole.relationshipToParty;
            if (rel != null && rel !== '') projection[propKey] = String(rel);
            continue;
        }

        if (
            pk.includes('birth') ||
            pk.includes('dob') ||
            pk.includes('date_of_birth') ||
            (pk.includes('date') && pk.includes('trust'))
        ) {
            const val = party.dateOfBirth ?? party.trustDate;
            if (val != null && val !== '') projection[propKey] = val;
            continue;
        }

        if (
            pk.includes('ssn') ||
            pk.includes('tax_id') ||
            pk.includes('taxid') ||
            pk.includes('itin') ||
            pk === 'us_tax_id_ss_number'
        ) {
            const ssn = extractTaxIdFromParty(party);
            if (ssn) projection[propKey] = ssn;
            continue;
        }

        if (
            pk.includes('share') ||
            pk.includes('percent') ||
            pk.includes('allocation') ||
            pk.includes('benefit')
        ) {
            const pct = party.beneficiaryPercentage;
            if (pct != null && pct !== '') {
                projection[propKey] =
                    typeof pct === 'number' ? String(pct) : pct;
            }
        }
    }

    return deepMergeFormPrefill(
        deepMergeFormPrefill({ ...seedItem }, projection),
        beneRow
    );
}

function projectPartyRowOntoItemSchema(
    seedItem: Record<string, unknown>,
    row: Record<string, unknown>,
    itemsSchema: Record<string, unknown>
): Record<string, unknown> {
    const normalized = {
        ...row,
        partyRole: isRecord(row.partyRole)
            ? row.partyRole
            : {
                  relationshipToParty:
                      typeof row.relationshipToParty === 'string'
                          ? row.relationshipToParty
                          : 'SELF',
              },
    };
    return projectBeneRowOntoItemSchema(seedItem, normalized, itemsSchema);
}

function mergePartyRowsOntoArraySchema(
    seedArr: unknown[],
    prefillRows: Record<string, unknown>[],
    itemsSchema: Record<string, unknown> | null
): unknown[] {
    const canProject =
        itemsSchema &&
        itemsSchema.type === 'object' &&
        isRecord(itemsSchema.properties) &&
        Object.keys(itemsSchema.properties).length > 0;

    const max = Math.max(seedArr.length, prefillRows.length);
    const out: unknown[] = [];
    for (let i = 0; i < max; i++) {
        const seedEl = seedArr[i];
        const seedItem = isPlainObject(seedEl)
            ? { ...(seedEl as Record<string, unknown>) }
            : {};
        const row = prefillRows[i];
        if (!isPlainObject(row)) {
            out.push(seedEl ?? {});
            continue;
        }
        if (canProject && itemsSchema) {
            out.push(projectPartyRowOntoItemSchema(seedItem, row, itemsSchema));
        } else {
            out.push(deepMergeFormPrefill(seedItem, row));
        }
    }
    return out;
}

function applyAnnuitantActionDataPrefillForSingleTab(
    policy: Policy,
    tab: { title: string; formSchema?: unknown },
    formData: Record<string, unknown>
): void {
    const tabCtx = tab.title.toLowerCase();
    if (!/annuitant/.test(tabCtx)) return;

    const annuitantRows = formatAnnuitants(policy as PolicyResponse) as Record<
        string,
        unknown
    >[];
    if (annuitantRows.length === 0) return;

    const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
    const properties = isRecord(formSchema.properties)
        ? formSchema.properties
        : {};

    let arrayKey: string | null = null;
    if (
        isRecord(properties.actionData) &&
        properties.actionData.type === 'array'
    ) {
        arrayKey = 'actionData';
    } else {
        for (const [k, schema] of Object.entries(properties)) {
            if (!isRecord(schema) || schema.type !== 'array') continue;
            const title = typeof schema.title === 'string' ? schema.title : '';
            const ctx = `${k} ${title}`.toLowerCase();
            if (ctx.includes('annuitant')) {
                arrayKey = k;
                break;
            }
        }
    }
    if (!arrayKey) return;

    const schema = properties[arrayKey];
    if (!isRecord(schema) || schema.type !== 'array') return;

    const itemsSchema = isRecord(schema.items)
        ? (schema.items as Record<string, unknown>)
        : null;
    const existing = formData[arrayKey];
    const seedArr = Array.isArray(existing) ? existing : [];

    formData[arrayKey] = mergePartyRowsOntoArraySchema(
        seedArr as unknown[],
        annuitantRows,
        itemsSchema
    );
}

function applyAssigneeOrPayeeActionDataPrefillForSingleTab(
    policy: Policy,
    tab: { title: string; formSchema?: unknown },
    formData: Record<string, unknown>
): void {
    const t = tab.title.toLowerCase();
    const isAssignee = /assignee/.test(t);
    const isPayee = /payee/.test(t);
    if (!isAssignee && !isPayee) return;
    if (/annuitant/.test(t)) return;

    const rows = (
        isAssignee
            ? formatAssigneePartyData(policy as PolicyResponse)
            : formatPayeePartyData(policy as PolicyResponse)
    ) as Record<string, unknown>[];
    if (rows.length === 0) return;

    const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
    const properties = isRecord(formSchema.properties)
        ? formSchema.properties
        : {};

    let arrayKey: string | null = null;
    if (
        isRecord(properties.actionData) &&
        properties.actionData.type === 'array'
    ) {
        arrayKey = 'actionData';
    } else {
        for (const [k, schema] of Object.entries(properties)) {
            if (!isRecord(schema) || schema.type !== 'array') continue;
            const title = typeof schema.title === 'string' ? schema.title : '';
            const ctx = `${k} ${title}`.toLowerCase();
            if (isAssignee && ctx.includes('assignee')) {
                arrayKey = k;
                break;
            }
            if (isPayee && ctx.includes('payee')) {
                arrayKey = k;
                break;
            }
        }
    }
    if (!arrayKey) return;

    const schema = properties[arrayKey];
    if (!isRecord(schema) || schema.type !== 'array') return;

    const itemsSchema = isRecord(schema.items)
        ? (schema.items as Record<string, unknown>)
        : null;
    const existing = formData[arrayKey];
    const seedArr = Array.isArray(existing) ? existing : [];

    formData[arrayKey] = mergePartyRowsOntoArraySchema(
        seedArr as unknown[],
        rows,
        itemsSchema
    );
}

function mergeBeneficiaryArrayWithSchema(
    seedArr: unknown[],
    prefillRows: Record<string, unknown>[],
    itemsSchema: Record<string, unknown> | null
): unknown[] {
    const canProject =
        itemsSchema &&
        itemsSchema.type === 'object' &&
        isRecord(itemsSchema.properties) &&
        Object.keys(itemsSchema.properties).length > 0;

    const max = Math.max(seedArr.length, prefillRows.length);
    const out: unknown[] = [];
    for (let i = 0; i < max; i++) {
        const seedEl = seedArr[i];
        const seedItem = isPlainObject(seedEl)
            ? { ...(seedEl as Record<string, unknown>) }
            : {};
        const bene = prefillRows[i];
        if (!isPlainObject(bene)) {
            out.push(seedEl ?? {});
            continue;
        }
        if (canProject && itemsSchema) {
            out.push(projectBeneRowOntoItemSchema(seedItem, bene, itemsSchema));
        } else {
            out.push(deepMergeFormPrefill(seedItem, bene));
        }
    }
    return out;
}

function splitBeneficiaryRows(rows: Record<string, unknown>[]): {
    primary: Record<string, unknown>[];
    contingent: Record<string, unknown>[];
} {
    const primary: Record<string, unknown>[] = [];
    const contingent: Record<string, unknown>[] = [];
    for (const row of rows) {
        const role = row?.partyRole as Record<string, unknown> | undefined;
        const pr = role?.partyRole;
        if (pr === PartyRoleType.PRIMARYBENEFICIARY) primary.push(row);
        else if (pr === PartyRoleType.CONTINGENTBENEFICIARY)
            contingent.push(row);
    }
    return { primary, contingent };
}

function applyBeneficiaryArrayPrefillForSingleTab(
    policy: Policy,
    tab: { title: string; formSchema?: unknown },
    formData: Record<string, unknown>
): void {
    const tabCtx = tab.title.toLowerCase();
    if (!tabCtx.includes('benefic')) return;

    const beneRows = formatBeneficiaries(policy as PolicyResponse) as Record<
        string,
        unknown
    >[];
    const { primary, contingent } = splitBeneficiaryRows(beneRows);

    const formSchema = isRecord(tab.formSchema) ? tab.formSchema : {};
    const properties = isRecord(formSchema.properties)
        ? formSchema.properties
        : {};

    for (const [key, schema] of Object.entries(properties)) {
        if (!isRecord(schema) || schema.type !== 'array') continue;
        const title = typeof schema.title === 'string' ? schema.title : '';
        const ctx = `${key} ${title}`.toLowerCase();
        const existing = formData[key];
        const seedArr = Array.isArray(existing) ? existing : [];

        let prefill: Record<string, unknown>[] = [];
        if (ctx.includes('contingent')) {
            prefill = contingent;
        } else if (ctx.includes('primary')) {
            prefill = primary;
        } else if (
            ctx.includes('benefic') ||
            Object.keys(properties).filter(
                (k) => isRecord(properties[k]) && properties[k].type === 'array'
            ).length === 1
        ) {
            prefill = beneRows;
        }

        if (prefill.length === 0) continue;
        const itemsSchema = isRecord(schema.items)
            ? (schema.items as Record<string, unknown>)
            : null;
        formData[key] = mergeBeneficiaryArrayWithSchema(
            seedArr as unknown[],
            prefill,
            itemsSchema
        );
    }
}

/**
 * Hydrates `generatedFormData[tabId]` per tab so values align with `ui:dataPath` and
 * duplicate field names on different tabs do not overwrite each other.
 */
export function applyAiPaperSemanticPrefillGeneratedFormData(
    policy: Policy,
    output: FullRjsfOutput,
    generatedFormData: Record<string, Record<string, unknown>>,
    useBeneficiaryPrefill: boolean
): void {
    const tabs = filterTabSchemasForSelfServe(output.schemaContent.tabSchemas);
    tabs.forEach((tab, index) => {
        const key = tabStorageKey(tab as { title: string; id?: string }, index);
        if (!isPlainObject(generatedFormData[key])) {
            generatedFormData[key] = {};
        }
        const slice = generatedFormData[key] as Record<string, unknown>;
        applySemanticFlatPrefillForSingleTab(policy, tab, slice);
        applyPartyDetailPrefillForSingleTab(policy, tab, slice);
        if (useBeneficiaryPrefill) {
            applyBeneficiaryArrayPrefillForSingleTab(
                policy,
                tab as { title: string; formSchema?: unknown },
                slice
            );
        }
        applyAnnuitantActionDataPrefillForSingleTab(
            policy,
            tab as { title: string; formSchema?: unknown },
            slice
        );
        applyAssigneeOrPayeeActionDataPrefillForSingleTab(
            policy,
            tab as { title: string; formSchema?: unknown },
            slice
        );
    });
}
