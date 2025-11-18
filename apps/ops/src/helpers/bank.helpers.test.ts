import { cleanup } from '@testing-library/react';
import {
    BankAccount,
    Party,
    PartyRole,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

import { LifeCadPartyRoles } from '@deps/models/case/withdrawal/case';

import {
    getBankOptions,
    getBankOptionsLC,
    getBankingDetails,
    getBankingDetailsLC,
    getSelectedOption,
    getSelectedOptionLC,
    isExistingBank,
    isExistingBankLC,
    isIrrevocableBeneficiaryExists,
    isIrrevocableBeneficiaryExistsLC,
} from './bank.helpers';

describe('helpers/bank.helpers', () => {
    afterEach(() => cleanup());

    describe('LifeCAD helpers', () => {
        const lcParty = (overrides: any = {}) =>
            ({
                Role: LifeCadPartyRoles.PrimaryOwner,
                Banking: [
                    { BankId: 1, BankName: 'First National' },
                    { BankId: 2, BankName: 'Second Bank' },
                ],
                ...overrides,
            } as any);

        it('getBankingDetailsLC returns primary owner banking or []', () => {
            expect(getBankingDetailsLC([lcParty()])).toHaveLength(2);
            expect(getBankingDetailsLC([lcParty({ Role: 'Other' })])).toEqual(
                []
            );
            expect(getBankingDetailsLC(undefined as any)).toEqual([]);
        });

        it('isExistingBankLC checks by BankName case-sensitive and handles falsy name', () => {
            const details = getBankingDetailsLC([lcParty()]);
            expect(isExistingBankLC(details, 'First National')).toBe(true);
            expect(isExistingBankLC(details, 'Unknown')).toBe(false);
            // falsy bankName becomes '' which should generally not match
            expect(isExistingBankLC(details, '' as any)).toBe(false);
        });

        it('getBankOptionsLC maps to label/value strings', () => {
            const details = getBankingDetailsLC([lcParty()]);
            const options = getBankOptionsLC(details);
            expect(options).toEqual([
                { label: 'First National', value: '1' },
                { label: 'Second Bank', value: '2' },
            ]);
        });

        it('getSelectedOptionLC finds by string BankId', () => {
            const details = getBankingDetailsLC([lcParty()]);
            expect(getSelectedOptionLC(details, '2')?.BankName).toBe(
                'Second Bank'
            );
            expect(getSelectedOptionLC(details, '999')).toBeUndefined();
        });

        it('isIrrevocableBeneficiaryExistsLC true when a Beneficiary role party is present', () => {
            const parties = [
                lcParty(),
                { Role: LifeCadPartyRoles.Beneficiary } as any,
            ];
            expect(isIrrevocableBeneficiaryExistsLC(parties as any)).toBe(true);
            expect(isIrrevocableBeneficiaryExistsLC([lcParty()] as any)).toBe(
                false
            );
            expect(isIrrevocableBeneficiaryExistsLC(undefined as any)).toBe(
                false
            );
        });
    });

    describe('SOR helpers', () => {
        const sorParty = (overrides: Partial<Party> = {}): Party =>
            ({ partyId: 'P1', ...overrides } as any);
        const beneRole = (partyId: string): PolicyPartyRoles =>
            ({ partyRole: PartyRole.PRIMARYBENEFICIARY, partyId } as any);

        const accounts: BankAccount[] = [
            { bankId: 10, branchName: 'First National' } as any,
            { bankId: 11, branchName: 'Second Bank' } as any,
        ];

        it('getBankingDetails returns owner bankDetails by OwnerRoleId or []', () => {
            const parties: any[] = [
                { partyRoleId: 'x', bankDetails: [{ bankId: 99 }] },
                { partyRoleId: '0|0|2', bankDetails: accounts },
            ];
            expect(getBankingDetails(parties as any)).toEqual(accounts);
            expect(getBankingDetails([] as any)).toEqual([]);
            expect(getBankingDetails(undefined as any)).toEqual([]);
        });

        it('isExistingBank checks by branchName and handles falsy name', () => {
            expect(isExistingBank(accounts, 'First National')).toBe(true);
            expect(isExistingBank(accounts, 'Missing')).toBe(false);
            expect(isExistingBank(accounts, '' as any)).toBe(false);
        });

        it('getBankOptions maps to label/value strings', () => {
            expect(getBankOptions(accounts)).toEqual([
                { label: 'First National', value: '10' },
                { label: 'Second Bank', value: '11' },
            ]);
        });

        it('getSelectedOption finds by string bankId', () => {
            expect(getSelectedOption(accounts, '11')?.branchName).toBe(
                'Second Bank'
            );
            expect(getSelectedOption(accounts, '999')).toBeUndefined();
        });

        it('isIrrevocableBeneficiaryExists checks presence of primary beneficiary in roles matched by partyId', () => {
            const parties: Party[] = [
                sorParty({ partyId: 'A' }),
                sorParty({ partyId: 'B' }),
            ];
            const roles: PolicyPartyRoles[] = [beneRole('B')];
            expect(isIrrevocableBeneficiaryExists(parties, roles)).toBe(true);

            const rolesNone: PolicyPartyRoles[] = [];
            expect(isIrrevocableBeneficiaryExists(parties, rolesNone)).toBe(
                false
            );
            expect(
                isIrrevocableBeneficiaryExists(undefined as any, rolesNone)
            ).toBe(false);
        });
    });
});
