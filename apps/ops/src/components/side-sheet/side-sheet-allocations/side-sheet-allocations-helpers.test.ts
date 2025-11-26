import { faker } from '@faker-js/faker';

import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import {
    Beneficiary,
    buildBeneficiaryAllocation,
    calculateTotalPercent,
    convertBenefitPercentagesToAllocationPercentages,
    determinePartyBeneficiaryRole,
    getBeneficiariesByFocusedParty,
    getBeneficiariesByRole,
} from './side-sheet-allocations-helpers';

describe('side-sheet-allocations helper', () => {
    describe('buildBeneficiaryAllocation', () => {
        it('Correctly combines beneficiary allocations from requested roles', () => {
            const benefitPercentages = {
                [PartyRole.PRIMARYBENEFICIARY]: [
                    { partyPolicyId: 'firstParty', allocationPercentage: 40 },
                    { partyPolicyId: 'secondParty', allocationPercentage: 60 },
                ],
                [PartyRole.CONTINGENTBENEFICIARY]: [
                    { partyPolicyId: 'thirdParty', allocationPercentage: 100 },
                ],
            };

            expect(
                buildBeneficiaryAllocation(benefitPercentages, [
                    PartyRole.CONTINGENTBENEFICIARY,
                ])
            ).toEqual(benefitPercentages.CONTINGENTBENEFICIARY);
            expect(
                buildBeneficiaryAllocation(benefitPercentages, [
                    PartyRole.PRIMARYBENEFICIARY,
                    PartyRole.CONTINGENTBENEFICIARY,
                ])
            ).toEqual([
                ...benefitPercentages[PartyRole.PRIMARYBENEFICIARY],
                ...benefitPercentages[PartyRole.CONTINGENTBENEFICIARY],
            ]);
            expect(buildBeneficiaryAllocation(benefitPercentages, [])).toEqual(
                []
            );
        });
    });
    describe('calculateTotalPercent', () => {
        it('Should calculate the total percent', () => {
            const primaryAllocations = {
                firstParty: 75,
                secondParty: 25,
            };
            expect(calculateTotalPercent(primaryAllocations)).toEqual(100);
        });
    });
    describe('convertBenefitPercentagesToAllocationPercentages', () => {
        it('Should convert the benefitPercentage object into the format usable by the API', () => {
            const primaryAllocations = {
                firstPartyId: 75,
                secondPartyId: 25,
            };
            const expectedOutput = [
                { partyPolicyId: 'firstPartyId', allocationPercentage: 75 },
                { partyPolicyId: 'secondPartyId', allocationPercentage: 25 },
            ];
            expect(
                convertBenefitPercentagesToAllocationPercentages(
                    primaryAllocations
                )
            ).toEqual(expectedOutput);
        });
    });
    describe('determinePartyBeneficiaryRole', () => {
        it('Should accurately identify the beneficiaryRole of a party', () => {
            const partyRoles = [
                { partyId: 'firstPartyId', partyRole: PartyRole.AGENT },
                { partyId: 'firstPartyId', partyRole: PartyRole.OWNER },
                { partyId: 'firstPartyId', partyRole: PartyRole.INSURED },
                {
                    partyId: 'firstPartyId',
                    partyRole: PartyRole.PRIMARYBENEFICIARY,
                },
                {
                    partyId: 'secondPartyId',
                    partyRole: PartyRole.CONTINGENTBENEFICIARY,
                },
            ];

            expect(
                determinePartyBeneficiaryRole(partyRoles, 'firstPartyId')
            ).toEqual(PartyRole.PRIMARYBENEFICIARY);
            expect(
                determinePartyBeneficiaryRole(partyRoles, 'secondPartyId')
            ).toEqual(PartyRole.CONTINGENTBENEFICIARY);
        });

        it('Should return undefined if there is no beneficiary role associated with the party', () => {
            const partyRoles = [
                { partyId: 'firstPartyId', partyRole: PartyRole.AGENT },
                { partyId: 'firstPartyId', partyRole: PartyRole.OWNER },
                { partyId: 'firstPartyId', partyRole: PartyRole.INSURED },
                {
                    partyId: 'secondPartyId',
                    partyRole: PartyRole.CONTINGENTBENEFICIARY,
                },
            ];
            expect(
                determinePartyBeneficiaryRole(partyRoles, 'firstPartyId')
            ).toBeUndefined();
        });
    });
    describe('getBeneficiariesByRole', () => {
        it('Should return all parties for the requested partyRole, sorted according to business rules (benefitPercentage then fullName)', () => {
            const partyRoles = [
                { partyId: 'firstPartyId', partyRole: PartyRole.AGENT },
                { partyId: 'firstPartyId', partyRole: PartyRole.OWNER },
                { partyId: 'firstPartyId', partyRole: PartyRole.INSURED },
                {
                    partyId: 'firstPartyId',
                    partyRole: PartyRole.PRIMARYBENEFICIARY,
                },
                {
                    partyId: 'secondPartyId',
                    partyRole: PartyRole.CONTINGENTBENEFICIARY,
                },
                {
                    partyId: 'thirdPartyId',
                    partyRole: PartyRole.PRIMARYBENEFICIARY,
                },
                {
                    partyId: 'fourthPartyId',
                    partyRole: PartyRole.CONTINGENTBENEFICIARY,
                },
                {
                    partyId: 'fifthPartyId',
                    partyRole: PartyRole.PRIMARYBENEFICIARY,
                },
                { partyId: 'fifthPartyId', partyRole: PartyRole.PAYEE },
                {
                    partyId: 'sixthPartyId',
                    partyRole: PartyRole.CONTINGENTBENEFICIARY,
                },
                {
                    partyId: 'seventhPartyId',
                    partyRole: PartyRole.PRIMARYBENEFICIARY,
                },
            ];
            const parties = [
                {
                    partyId: 'firstPartyId',
                    firstName: 'first',
                    lastName: 'Party',
                    beneficiaryPercentage: 1,
                },
                {
                    partyId: 'secondPartyId',
                    firstName: 'second',
                    lastName: 'Party',
                    beneficiaryPercentage: 100,
                },
                {
                    partyId: 'thirdPartyId',
                    firstName: 'third',
                    lastName: 'Party',
                    beneficiaryPercentage: 20,
                },
                {
                    partyId: 'fourthPartyId',
                    firstName: 'fourth',
                    lastName: 'Party',
                    beneficiaryPercentage: 0,
                },
                {
                    partyId: 'fifthPartyId',
                    firstName: 'fifth',
                    lastName: 'Party',
                    beneficiaryPercentage: 20,
                },
                {
                    partyId: 'sixthPartyId',
                    firstName: 'sixth',
                    lastName: 'Party',
                    beneficiaryPercentage: 0,
                },
                {
                    partyId: 'seventhPartyId',
                    firstName: 'seventh',
                    lastName: 'Party',
                    beneficiaryPercentage: 59,
                },
            ];

            const expectedOutput = [
                {
                    firstLastName: 'Seventh Party',
                    beneficiaryPercentage: 59,
                    partyId: 'seventhPartyId',
                },
                {
                    firstLastName: 'Fifth Party',
                    beneficiaryPercentage: 20,
                    partyId: 'fifthPartyId',
                },
                {
                    firstLastName: 'Third Party',
                    beneficiaryPercentage: 20,
                    partyId: 'thirdPartyId',
                },
                {
                    firstLastName: 'First Party',
                    beneficiaryPercentage: 1,
                    partyId: 'firstPartyId',
                },
            ];

            expect(
                getBeneficiariesByRole(
                    { parties, partyRoles } as Policy,
                    PartyRole.PRIMARYBENEFICIARY
                )
            ).toEqual(expectedOutput);
        });
    });
    describe('getBeneficiariesByFocusedParty', () => {
        const beneficiaries: Beneficiary[] = [
            {
                firstLastName: 'Seventh Party',
                beneficiaryPercentage: 59,
                partyId: 'seventhPartyId',
            },
            {
                firstLastName: 'Fifth Party',
                beneficiaryPercentage: 20,
                partyId: 'fifthPartyId',
            },
            {
                firstLastName: 'Third Party',
                beneficiaryPercentage: 20,
                partyId: 'thirdPartyId',
            },
            {
                firstLastName: 'First Party',
                beneficiaryPercentage: 1,
                partyId: 'firstPartyId',
            },
        ];
        const { partyId: focusedPartyID } =
            faker.helpers.arrayElement(beneficiaries);
        const { focusedParty, otherParties } = getBeneficiariesByFocusedParty(
            beneficiaries,
            focusedPartyID
        );

        it('should correctly identify focused party by ID', () => {
            expect(focusedPartyID).toEqual(focusedParty?.partyId);
        });

        it('should correctly identify non-focused parties', () => {
            const filteredPartiers = beneficiaries.filter(
                ({ partyId }) => partyId !== focusedPartyID
            );
            expect(otherParties).toEqual(filteredPartiers);
        });
    });
});
