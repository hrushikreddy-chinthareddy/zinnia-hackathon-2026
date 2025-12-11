import { cleanup } from '@testing-library/react';

import {
    getOwnerStateOfResidence,
    getAnnuitantStateOfResidence,
    validQualTypesForSpousalSignature,
    validQualTypesForSpousalSignatureFAST,
    spousalSignatureOnAnnuitantStateCodes,
} from './otp-withdrawal.helpers';

describe('helpers/otp-withdrawal.helpers', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    describe('getOwnerStateOfResidence', () => {
        it('returns state from DEFAULT address when present', () => {
            const formParty: any = {
                parties: [
                    {
                        partyRoleType: 'OWNER',
                        addresses: [{ addressType: 'DEFAULT', state: 'NY' }],
                    },
                ],
            };
            expect(getOwnerStateOfResidence(formParty)).toBe('NY');
        });

        it('falls back to first address when DEFAULT not present', () => {
            const formParty: any = {
                parties: [
                    {
                        partyRoleType: 'OWNER',
                        addresses: [{ addressType: 'RESIDENCE', state: 'CA' }],
                    },
                ],
            };
            expect(getOwnerStateOfResidence(formParty)).toBe('CA');
        });

        it('returns null when no owner or no addresses', () => {
            expect(getOwnerStateOfResidence({ parties: [] } as any)).toBeNull();
            expect(
                getOwnerStateOfResidence({
                    parties: [{ partyRoleType: 'OWNER', addresses: [] }],
                } as any)
            ).toBeNull();
        });
    });

    describe('getAnnuitantStateOfResidence', () => {
        it('returns state from DEFAULT address when present', () => {
            const formParty: any = {
                parties: [
                    {
                        partyRoleType: 'ANNUITANT',
                        addresses: [{ addressType: 'DEFAULT', state: 'TX' }],
                    },
                ],
            };
            expect(getAnnuitantStateOfResidence(formParty)).toBe('TX');
        });

        it('returns null when no annuitant', () => {
            expect(
                getAnnuitantStateOfResidence({ parties: [] } as any)
            ).toBeNull();
        });
    });

    describe('constants', () => {
        it('validQualTypesForSpousalSignature contains expected values', () => {
            expect(validQualTypesForSpousalSignature).toEqual(
                expect.arrayContaining([
                    'Cust Inh IRA',
                    'Cust Inh Roth IRA',
                    'Cust Rollover IRA',
                ])
            );
        });
        it('validQualTypesForSpousalSignatureFAST contains expected fast values', () => {
            expect(validQualTypesForSpousalSignatureFAST).toEqual(
                expect.arrayContaining([
                    'CUSTODIALINDIVIDUALRETIREMENTACCOUNT',
                    'CUSTODIALROTHINDIVIDUALRETIREMENTACCOUNT',
                ])
            );
        });
        it('spousalSignatureOnAnnuitantStateCodes includes states list', () => {
            expect(spousalSignatureOnAnnuitantStateCodes).toEqual(
                expect.arrayContaining(['ID', 'NV', 'TX', 'WA'])
            );
        });
    });
});
