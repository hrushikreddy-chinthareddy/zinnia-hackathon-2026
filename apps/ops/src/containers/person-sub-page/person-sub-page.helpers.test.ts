import { PartyRole } from '@zinnia/api-types/types/sor';

import {
    DEFAULT_PERSON_ROLE_TAB,
    getAgentRoles,
    getNonAgentRoles,
    hasAgentAndNonAgentRoles,
    isAgentRole,
    PersonRoleTabValues,
    resolvePersonRoleTab,
} from './person-sub-page.helpers';

const makeRole = (partyRole: string) =>
    ({ partyRole } as { partyRole: PartyRole });

describe('person-sub-page.helpers', () => {
    describe('isAgentRole', () => {
        it.each([
            PartyRole.AGENT,
            PartyRole.PRIMARYWRITINGAGENT,
            PartyRole.PRIMARYSERVICINGAGENT,
            PartyRole.ADDITIONALSERVICINGAGENT,
            PartyRole.ADDITIONALWRITINGGAGENT,
        ])('returns true for agent role "%s"', (role) => {
            expect(isAgentRole(role)).toBe(true);
        });

        it('is case-insensitive', () => {
            expect(isAgentRole('primarywritingagent')).toBe(true);
            expect(isAgentRole('Agent')).toBe(true);
        });

        it.each([
            PartyRole.OWNER,
            PartyRole.INSURED,
            PartyRole.PRIMARYBENEFICIARY,
            PartyRole.CONTINGENTBENEFICIARY,
            PartyRole.PAYOR,
            PartyRole.PAYEE,
            PartyRole.THIRDPARTYDESIGNEE,
            PartyRole.JOINTOWNER,
            PartyRole.COVERAGEINSURED,
            PartyRole.ASSIGNEE,
            PartyRole.ANNUITANT,
        ])('returns false for non-agent role "%s"', (role) => {
            expect(isAgentRole(role)).toBe(false);
        });
    });

    describe('hasAgentAndNonAgentRoles', () => {
        it('returns true when person has both agent and non-agent roles', () => {
            const roles = [
                makeRole(PartyRole.OWNER),
                makeRole(PartyRole.PRIMARYWRITINGAGENT),
            ];
            expect(hasAgentAndNonAgentRoles(roles)).toBe(true);
        });

        it('returns false when person has only agent roles', () => {
            const roles = [
                makeRole(PartyRole.PRIMARYWRITINGAGENT),
                makeRole(PartyRole.PRIMARYSERVICINGAGENT),
            ];
            expect(hasAgentAndNonAgentRoles(roles)).toBe(false);
        });

        it('returns false when person has only non-agent roles', () => {
            const roles = [
                makeRole(PartyRole.OWNER),
                makeRole(PartyRole.INSURED),
            ];
            expect(hasAgentAndNonAgentRoles(roles)).toBe(false);
        });

        it('returns false for empty roles array', () => {
            expect(hasAgentAndNonAgentRoles([])).toBe(false);
        });

        it('handles multiple agent + multiple non-agent roles', () => {
            const roles = [
                makeRole(PartyRole.OWNER),
                makeRole(PartyRole.INSURED),
                makeRole(PartyRole.PRIMARYWRITINGAGENT),
                makeRole(PartyRole.PRIMARYSERVICINGAGENT),
            ];
            expect(hasAgentAndNonAgentRoles(roles)).toBe(true);
        });
    });

    describe('getAgentRoles', () => {
        it('returns only agent roles', () => {
            const roles = [
                makeRole(PartyRole.OWNER),
                makeRole(PartyRole.PRIMARYWRITINGAGENT),
                makeRole(PartyRole.INSURED),
                makeRole(PartyRole.PRIMARYSERVICINGAGENT),
            ];
            const result = getAgentRoles(roles);
            expect(result).toHaveLength(2);
            expect(result[0].partyRole).toBe(PartyRole.PRIMARYWRITINGAGENT);
            expect(result[1].partyRole).toBe(PartyRole.PRIMARYSERVICINGAGENT);
        });

        it('returns empty array when no agent roles exist', () => {
            const roles = [
                makeRole(PartyRole.OWNER),
                makeRole(PartyRole.INSURED),
            ];
            expect(getAgentRoles(roles)).toHaveLength(0);
        });
    });

    describe('getNonAgentRoles', () => {
        it('returns only non-agent roles', () => {
            const roles = [
                makeRole(PartyRole.OWNER),
                makeRole(PartyRole.PRIMARYWRITINGAGENT),
                makeRole(PartyRole.INSURED),
            ];
            const result = getNonAgentRoles(roles);
            expect(result).toHaveLength(2);
            expect(result[0].partyRole).toBe(PartyRole.OWNER);
            expect(result[1].partyRole).toBe(PartyRole.INSURED);
        });

        it('returns empty array when all roles are agent roles', () => {
            const roles = [
                makeRole(PartyRole.PRIMARYWRITINGAGENT),
                makeRole(PartyRole.AGENT),
            ];
            expect(getNonAgentRoles(roles)).toHaveLength(0);
        });
    });

    describe('resolvePersonRoleTab', () => {
        it('returns policy-details for undefined input', () => {
            expect(resolvePersonRoleTab(undefined)).toBe(
                DEFAULT_PERSON_ROLE_TAB
            );
        });

        it('returns policy-details for invalid/unknown tab value', () => {
            expect(resolvePersonRoleTab('invalid-tab')).toBe(
                DEFAULT_PERSON_ROLE_TAB
            );
        });

        it('returns policy-details for empty string', () => {
            expect(resolvePersonRoleTab('')).toBe(DEFAULT_PERSON_ROLE_TAB);
        });

        it('returns policy-details when given "policy-details"', () => {
            expect(resolvePersonRoleTab('policy-details')).toBe(
                PersonRoleTabValues.policyDetails
            );
        });

        it('returns agent-details when given "agent-details"', () => {
            expect(resolvePersonRoleTab('agent-details')).toBe(
                PersonRoleTabValues.agentDetails
            );
        });
    });

    describe('PersonRoleTabValues', () => {
        it('has exactly two tab values', () => {
            expect(Object.keys(PersonRoleTabValues)).toHaveLength(2);
        });

        it('contains policy-details and agent-details', () => {
            expect(PersonRoleTabValues.policyDetails).toBe('policy-details');
            expect(PersonRoleTabValues.agentDetails).toBe('agent-details');
        });
    });

    describe('DEFAULT_PERSON_ROLE_TAB', () => {
        it('is policy-details', () => {
            expect(DEFAULT_PERSON_ROLE_TAB).toBe('policy-details');
        });
    });
});
