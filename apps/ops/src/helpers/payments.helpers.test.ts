import { FlatExtraType, Party, PolicyCoverage, SystematicProgram } from '@zinnia/api-types/types/sor';

import { getBankDetails, getFlatExtra, getParty } from './payments.helpers';

describe('payments.helper.ts', () => {
    describe('getBankDetails', () => {
        it('should return the first bank detail if party has bankDetails', () => {
            const party: Party = {
                bankDetails: [{ accountNumber: '12345', bankId: '1' }],
            };
            const systematicProgram: SystematicProgram = {
                party: [{ bankId: '1' }],
            };
            expect(getBankDetails(party, systematicProgram)).toEqual({ accountNumber: '12345', bankId: '1' });
        });

        it('should return undefined if party and systematicprogram is undefined', () => {
            expect(getBankDetails(undefined, undefined)).toBeUndefined();
        });

        it('should return undefined if party has no bankDetails', () => {
            const party: Party = {};
            const systematicProgram: SystematicProgram = {
                party: [{ bankId: '1' }],
            };
            expect(getBankDetails(party, systematicProgram)).toBeUndefined();
        });

        it('should return undefined if systematicprogram has no parties', () => {
            const party: Party = {
                bankDetails: [{ accountNumber: '12345', bankId: '1' }],
            };
            const systematicProgram: SystematicProgram = {};
            expect(getBankDetails(party, systematicProgram)).toBeUndefined();
        });
    });

    describe('getFlatExtra', () => {
        it('should return flatExtra if coverage has coverageLayers and coverageParticipants', () => {
            const coverage: PolicyCoverage = {
                coverageLayers: [
                    {
                        coverageParticipants: [{ flatExtra: [{ flatExtraType: FlatExtraType.TEMP }] }],
                    },
                ],
            };
            expect(getFlatExtra(coverage)).toEqual([{ flatExtraType: FlatExtraType.TEMP }]);
        });

        it('should return an empty array if coverage is undefined', () => {
            expect(getFlatExtra(undefined)).toEqual([]);
        });

        it('should return an empty array if coverage has no coverageLayers', () => {
            const coverage: PolicyCoverage = {};
            expect(getFlatExtra(coverage)).toEqual([]);
        });

        it('should return an empty array if coverageParticipants has no flatExtra', () => {
            const coverage: PolicyCoverage = {
                coverageLayers: [
                    {
                        coverageParticipants: [{}],
                    },
                ],
            };
            expect(getFlatExtra(coverage)).toEqual([]);
        });
    });

    describe('getParty', () => {
        it('should return the party with the matching partyId', () => {
            const parties: Party[] = [
                { partyId: '1', firstName: 'Party-1' },
                { partyId: '2', firstName: 'Party-2' },
            ];
            const systematicProgram: SystematicProgram = {
                party: [{ partyId: '2' }],
            };
            expect(getParty(parties, systematicProgram)).toEqual({ partyId: '2', firstName: 'Party-2' });
        });

        it('should return undefined if parties is undefined', () => {
            const systematicProgram: SystematicProgram = {
                party: [{ partyId: '1' }],
            };
            expect(getParty(undefined, systematicProgram)).toBeUndefined();
        });

        it('should return undefined if no party matches the partyId', () => {
            const parties: Party[] = [{ partyId: '1', firstName: 'Party-1' }];
            const systematicProgram: SystematicProgram = {
                party: [{ partyId: '2' }],
            };
            expect(getParty(parties, systematicProgram)).toBeUndefined();
        });
    });
});
