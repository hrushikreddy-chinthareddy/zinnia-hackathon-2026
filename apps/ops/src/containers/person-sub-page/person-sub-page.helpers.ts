import { AGENT_ROLES } from '@deps/types/constants';
import { PolicyPartyRoles } from '@zinnia/api-types/types/sor';

/** Valid tab values for the person role tabs */
export const PersonRoleTabValues = {
    policyDetails: 'policy-details',
    agentDetails: 'agent-details',
} as const;

export type PersonRoleTab =
    (typeof PersonRoleTabValues)[keyof typeof PersonRoleTabValues];

/** Default tab when none is specified or an invalid value is provided */
export const DEFAULT_PERSON_ROLE_TAB: PersonRoleTab =
    PersonRoleTabValues.policyDetails;

/**
 * Checks whether a given party role string is an agent role.
 * Uses the existing AGENT_ROLES constant, plus handles the known
 * 'ADDITIONALWRITINGAGENT' typo variant.
 */
export const isAgentRole = (role: string): boolean => {
    const upper = role.toUpperCase();
    return AGENT_ROLES.map((r) => r.toUpperCase()).includes(upper);
};

/**
 * Determines whether a person has at least one agent role AND
 * at least one non-agent role on the same policy.
 * This is the trigger condition for showing role tabs.
 */
export const hasAgentAndNonAgentRoles = (
    roles: PolicyPartyRoles[]
): boolean => {
    const hasAgent = roles.some(
        (r) => !!r.partyRole && isAgentRole(r.partyRole)
    );
    const hasNonAgent = roles.some(
        (r) => !r.partyRole || !isAgentRole(r.partyRole)
    );
    return hasAgent && hasNonAgent;
};

/**
 * Filters roles to only agent roles.
 */
export const getAgentRoles = (
    roles: PolicyPartyRoles[]
): PolicyPartyRoles[] => {
    return roles.filter((r) => !!r.partyRole && isAgentRole(r.partyRole));
};

/**
 * Filters roles to only non-agent roles.
 */
export const getNonAgentRoles = (
    roles: PolicyPartyRoles[]
): PolicyPartyRoles[] => {
    return roles.filter((r) => !r.partyRole || !isAgentRole(r.partyRole));
};

/**
 * Resolves a URL slug value to a valid PersonRoleTab.
 * Falls back to the default tab for unknown/invalid values.
 */
export const resolvePersonRoleTab = (
    tabSlug: string | undefined
): PersonRoleTab => {
    const validTabs: string[] = Object.values(PersonRoleTabValues);
    if (tabSlug && validTabs.includes(tabSlug)) {
        return tabSlug as PersonRoleTab;
    }
    return DEFAULT_PERSON_ROLE_TAB;
};
