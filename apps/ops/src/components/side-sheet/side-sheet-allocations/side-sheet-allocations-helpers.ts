import { getFirstLastName } from '@deps/helpers/party-info-helpers';
import {
    PartyRole,
    Policy,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

export interface AllocationPercentage {
    allocationPercentage: number;
    partyPolicyId: PartyId;
}
export type PartyId = string;
export interface PartyPercentage {
    [key: PartyId]: number;
}
export interface Beneficiary {
    partyId?: string;
    beneficiaryPercentage?: number;
    firstLastName?: string;
}
export interface BennyPercent {
    [key: string]: number;
}

export const beneficiaryRoles = [
    PartyRole.PRIMARYBENEFICIARY,
    PartyRole.CONTINGENTBENEFICIARY,
] as Partial<PartyRole[]>;

export const buildBeneficiaryAllocation = (
    benefitPercentages: { [key: string]: AllocationPercentage[] },
    roles: (PartyRole | undefined)[]
): AllocationPercentage[] => {
    const percentages = [] as AllocationPercentage[];
    roles.forEach((role) => {
        percentages.push(...benefitPercentages[role as string]);
    });
    return percentages;
};

export const calculateTotalPercent = (bp: BennyPercent): number => {
    return (Object.values(bp) as number[]).reduce(
        (acc, val): number => acc + val,
        0
    );
};

export const convertBenefitPercentagesToAllocationPercentages = (
    bp: BennyPercent
): AllocationPercentage[] => {
    return Object.keys(bp).map((partyId) => {
        return { partyPolicyId: partyId, allocationPercentage: bp[partyId] };
    });
};

export const determinePartyBeneficiaryRole = (
    partyRoles: PolicyPartyRoles[] = [],
    partyID: PartyId
): PartyRole | undefined => {
    const focusedParty = partyRoles.find((party) => {
        return (
            party.partyId === partyID &&
            beneficiaryRoles.includes(party.partyRole)
        );
    });

    return focusedParty?.partyRole;
};

// Gets all parties for the roles we're allocating, then sorts them according to business rules (benefitPercentage then fullName)
export const getBeneficiariesByRole = (
    { parties = [], partyRoles = [] }: Policy,
    roleToAllocate: PartyRole | undefined
): Beneficiary[] | undefined => {
    const partyIds = partyRoles
        .filter((party) => party.partyRole === roleToAllocate)
        .map((party) => party.partyId);

    return parties
        .filter((party) => partyIds.includes(party.partyId))
        .map((party) => {
            return {
                firstLastName: getFirstLastName(party),
                partyId: party.partyId,
                beneficiaryPercentage: party.beneficiaryPercentage,
            };
        })
        .sort((a, b) => {
            if (a.beneficiaryPercentage !== b.beneficiaryPercentage) {
                return (
                    Number(b.beneficiaryPercentage) -
                    Number(a.beneficiaryPercentage)
                );
            }
            return a.firstLastName.localeCompare(b.firstLastName);
        });
};

/**
 * Separates beneficiaries into the focused party and all other parties based on the provided party ID.
 *
 * @param {Beneficiary[]} beneficiaries - An array of beneficiaries.
 * @param {string | undefined} focusedPartyId - The party ID to focus on. If `undefined`, the function will not find a focused party.
 * @returns {Object} An object with two properties: `focusedParty`, which will be the beneficiary with the provided party ID or `undefined`,
 *                   and `otherParties`, which will be an array of all other beneficiaries.
 * @returns {Beneficiary | undefined} focusedParty - The beneficiary with the matching party ID. Returns `undefined` if no match found.
 * @returns {Beneficiary[]} otherParties - An array of all beneficiaries excluding the focused party.
 * @example
 * const beneficiaries = [
 *   { partyID: '1', name: 'Alice', beneficiaryPercentage: 33 },
 *   { partyID: '2', name: 'Bob', beneficiaryPercentage: 33 },
 *   { partyID: '3', name: 'James', beneficiaryPercentage: 34 },
 * ];
 * const result = getBeneficiariesByFocusedParty(beneficiaries, '1');
 * // result: {
 *      focusedParty: { partyID: '1', name: 'Alice', beneficiaryPercentage: 33 },
 *      otherParties: [
 *          { partyID: '2', name: 'Bob', beneficiaryPercentage: 33 },
 *          { partyID: '3', name: 'James', beneficiaryPercentage: 34 },
 *      ]
 *    }
 */
export const getBeneficiariesByFocusedParty = (
    beneficiaries: Beneficiary[],
    focusedPartyId: string | undefined
): {
    focusedParty: Beneficiary | undefined;
    otherParties: Beneficiary[];
} =>
    beneficiaries.reduce<{
        focusedParty: Beneficiary | undefined;
        otherParties: Beneficiary[];
    }>(
        (acc, beneficiary) => {
            if (beneficiary.partyId === focusedPartyId) {
                acc.focusedParty = beneficiary;
            } else {
                acc.otherParties.push(beneficiary);
            }
            return acc;
        },
        { focusedParty: undefined, otherParties: [] }
    );
