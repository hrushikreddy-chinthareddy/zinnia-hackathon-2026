import {
    FlatExtra,
    Parties,
    PolicyCoverage,
    SystematicProgram,
} from '@zinnia/api-types/types/sor';

import { getBankDetails, getFlatExtra, getParty } from './payments.helpers';

describe('payments.helper.ts', () => {
    describe('getBankDetails', () => {
        it('should return the first bank detail if party has bankDetails', () => {
            const party: Parties = {
                bankDetails: [{ accountNumber: '12345', bankId: '1' }],
            };
            const systematicProgram: SystematicProgram = {
                parties: [{ bankId: '1' }],
                externalArrangementId: '1',
            };
            expect(getBankDetails(party, systematicProgram)).toEqual({
                accountNumber: '12345',
                bankId: '1',
            });
        });

        it('should return undefined if party and systematicprogram is undefined', () => {
            expect(getBankDetails(undefined, undefined)).toBeUndefined();
        });

        it('should return undefined if party has no bankDetails', () => {
            const party: Parties = {};
            const systematicProgram: SystematicProgram = {
                parties: [{ bankId: '1' }],
                externalArrangementId: '1',
            };
            expect(getBankDetails(party, systematicProgram)).toBeUndefined();
        });

        it('should return undefined if systematicprogram has no parties', () => {
            const party: Parties = {
                bankDetails: [{ accountNumber: '12345', bankId: '1' }],
            };
            const systematicProgram: SystematicProgram = {
                externalArrangementId: '1',
            };
            expect(getBankDetails(party, systematicProgram)).toBeUndefined();
        });
    });

    describe('getFlatExtra', () => {
        it('should return flatExtra if coverage has coverageLayers and coverageParticipants', () => {
            const coverage: PolicyCoverage = {
                coverageLayers: [
                    {
                        coverageParticipants: [
                            {
                                flatExtra: [
                                    {
                                        flatExtraType:
                                            FlatExtra.flatExtraType.TEMPORARY,
                                    },
                                ],
                            },
                        ],
                        coverageTerm: 1,
                    },
                ],
            };
            expect(getFlatExtra(coverage)).toEqual([
                { flatExtraType: FlatExtra.flatExtraType.TEMPORARY },
            ]);
        });

        it('should return an empty array if coverage is undefined', () => {
            expect(getFlatExtra(undefined)).toEqual([]);
        });

        it('should return an empty array if coverage has no coverageLayers', () => {
            const coverage: PolicyCoverage = {};
            expect(getFlatExtra(coverage)).toEqual([]);
        });

        it('should return an empty array if coverageParticipants has no flatExtra', () => {
            const coverage = {
                coverageLayers: [
                    {
                        coverageParticipants: [{}],
                        coverageTerm: 1,
                    },
                ],
            };
            expect(getFlatExtra(coverage)).toEqual([]);
        });
    });

    describe('getParty', () => {
        it('should return the party with the matching partyId', () => {
            const parties: Parties[] = [
                { partyId: '1', firstName: 'Party-1' },
                { partyId: '2', firstName: 'Party-2' },
            ];
            const systematicProgram = {
                parties: [{ partyId: '2' }],
                externalArrangementId: '1',
            };
            expect(getParty(parties, systematicProgram)).toEqual({
                partyId: '2',
                firstName: 'Party-2',
            });
        });

        it('should return undefined if parties is undefined', () => {
            const systematicProgram = {
                parties: [{ partyId: '1' }],
                externalArrangementId: '1',
            };
            expect(getParty(undefined, systematicProgram)).toBeUndefined();
        });

        it('should return undefined if no party matches the partyId', () => {
            const parties: Parties[] = [{ partyId: '1', firstName: 'Party-1' }];
            const systematicProgram = {
                parties: [{ partyId: '2' }],
                externalArrangementId: '1',
            };
            expect(getParty(parties, systematicProgram)).toBeUndefined();
        });
    });
});
