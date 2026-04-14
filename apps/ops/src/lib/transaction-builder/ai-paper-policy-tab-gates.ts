import { PartyRole } from '@zinnia/api-types/types/sor';

/**
 * If a field label/key clearly names a non-primary party, primary insured/owner
 * prefill must not touch it (and insured/annuitant semantic name must not apply).
 * Order matters: more specific patterns first.
 */
const CONTEXT_PARTY_ROLE_MATCHERS: ReadonlyArray<{
    role: PartyRole;
    re: RegExp;
}> = [
    { role: PartyRole.JOINTOWNER, re: /\bjoint\s+owner\b|joint_owner/ },
    {
        role: PartyRole.JOINTANNUITANT,
        re: /\bjoint\s+annuitant\b|joint_annuitant/,
    },
    {
        role: PartyRole.THIRDPARTYDESIGNEE,
        re: /third[\s-]party[\s_-]*designee|third_party_designee/,
    },
    { role: PartyRole.ASSIGNEE, re: /\bassignee\b|assignee_/ },
    { role: PartyRole.PAYOR, re: /\bpayor\b|payor_/ },
    { role: PartyRole.PAYEE, re: /\bpayee\b|payee_/ },
];

export function contextHintsPartyRole(contextLower: string): PartyRole | null {
    for (const { role, re } of CONTEXT_PARTY_ROLE_MATCHERS) {
        if (re.test(contextLower)) return role;
    }
    return null;
}
