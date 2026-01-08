import { cleanup } from '@testing-library/react';

import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    PartyRole,
    TaxRateToUse,
    TaxWithholdingInstructions,
    TaxWithholdingType,
} from '@zinnia/api-types/types/sor';

import {
    getFormErrors,
    getOwnersTaxJurisdictionState,
    mapTaxWithholdingInstructionsFromViewModel,
    mapTaxWithholdingInstructionsToViewModel,
} from './taxes.helpers';

describe('helpers/transactions/taxes.helpers', () => {
    afterEach(() => cleanup());

    describe('getFormErrors', () => {
        const empty = {
            dollarAmount: '',
            percentAmount: '',
            withholdMinimum: false,
            withholdNone: false,
        } as any;

        it('flags federalNothing and stateNothing when no inputs or checkboxes selected', () => {
            const errors = getFormErrors(empty, empty);
            expect(errors).toMatchObject({
                federalNothing: true,
                stateNothing: true,
            });
        });

        it('flags federalBothInputs when both inputs provided and no checkboxes', () => {
            const fed = {
                dollarAmount: '10',
                percentAmount: '5',
                withholdMinimum: false,
                withholdNone: false,
            } as any;
            const errors = getFormErrors(fed, empty);
            expect(errors.federalBothInputs).toBe(true);
            expect(errors.stateNothing).toBe(true);
        });

        it('flags federalBothCheckboxes when both checkboxes selected', () => {
            const fed = { withholdMinimum: true, withholdNone: true } as any;
            const errors = getFormErrors(fed, empty);
            expect(errors.federalBothCheckboxes).toBe(true);
        });

        it('flags stateBothInputs and stateBothCheckboxes appropriately', () => {
            const st1 = {
                dollarAmount: '1',
                percentAmount: '2',
                withholdMinimum: false,
                withholdNone: false,
            } as any;
            const e1 = getFormErrors(empty, st1);
            expect(e1.stateBothInputs).toBe(true);

            const st2 = { withholdMinimum: true, withholdNone: true } as any;
            const e2 = getFormErrors(empty, st2);
            expect(e2.stateBothCheckboxes).toBe(true);
        });
    });

    describe('mapTaxWithholdingInstructionsFromViewModel', () => {
        it('uses USEDEFAULTTABLE when withholdMinimum and zeroes amounts', () => {
            const vm = {
                withholdMinimum: true,
                dollarAmount: '50',
                percentAmount: '10',
            } as any;
            const out = mapTaxWithholdingInstructionsFromViewModel(
                vm,
                TaxWithholdingType.FEDERAL
            );
            expect(out).toMatchObject({
                taxRateToUse: TaxRateToUse.USEDEFAULTTABLE,
                dollar: 0,
                percentage: 0,
                taxWithholdingType: TaxWithholdingType.FEDERAL,
            });
        });

        it('uses NOWITHHOLDINGELECTED when withholdNone and zeroes amounts', () => {
            const vm = {
                withholdNone: true,
                dollarAmount: '50',
                percentAmount: '10',
            } as any;
            const out = mapTaxWithholdingInstructionsFromViewModel(
                vm,
                TaxWithholdingType.STATE
            );
            expect(out.taxRateToUse).toBe(TaxRateToUse.NOWITHHOLDINGELECTED);
            expect(out.dollar).toBe(0);
            expect(out.percentage).toBe(0);
        });

        it('uses USEVALUESENTERED when values provided and converts to numbers', () => {
            const vm = { dollarAmount: '150', percentAmount: '7.5' } as any;
            const out = mapTaxWithholdingInstructionsFromViewModel(
                vm,
                TaxWithholdingType.FEDERAL
            );
            expect(out).toMatchObject({
                taxRateToUse: TaxRateToUse.USEVALUESENTERED,
                dollar: 150,
                percentage: 7.5,
            });
        });

        it('treats empty strings as undefined (zeroed amounts)', () => {
            const vm = { dollarAmount: '', percentAmount: '' } as any;
            const out = mapTaxWithholdingInstructionsFromViewModel(
                vm,
                TaxWithholdingType.STATE
            );
            expect(out).toMatchObject({ dollar: 0, percentage: 0 });
        });
    });

    describe('mapTaxWithholdingInstructionsToViewModel', () => {
        it('returns empty object when input is undefined', () => {
            const out = mapTaxWithholdingInstructionsToViewModel(undefined);
            expect(out).toEqual({});
        });

        it('maps numeric amounts to strings and sets flags based on taxRateToUse', () => {
            const th: TaxWithholdingInstructions = {
                exemptions: 0,
                dollar: 200,
                percentage: 12,
                taxRateToUse: TaxRateToUse.USEVALUESENTERED,
                taxWithholdingType: TaxWithholdingType.FEDERAL,
            };
            const out = mapTaxWithholdingInstructionsToViewModel(th);
            expect(out).toEqual({
                dollarAmount: '200',
                percentAmount: '12',
                withholdMinimum: false,
                withholdNone: false,
            });
        });

        it('sets withholdMinimum when USEDEFAULTTABLE and empties amounts', () => {
            const th: TaxWithholdingInstructions = {
                exemptions: 0,
                dollar: 0,
                percentage: 0,
                taxRateToUse: TaxRateToUse.USEDEFAULTTABLE,
                taxWithholdingType: TaxWithholdingType.STATE,
            };
            const out = mapTaxWithholdingInstructionsToViewModel(th);
            expect(out).toEqual({
                dollarAmount: '',
                percentAmount: '',
                withholdMinimum: true,
                withholdNone: false,
            });
        });

        it('sets withholdNone when NOWITHHOLDINGELECTED and empties amounts', () => {
            const th: TaxWithholdingInstructions = {
                exemptions: 0,
                dollar: 0,
                percentage: 0,
                taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
                taxWithholdingType: TaxWithholdingType.STATE,
            };
            const out = mapTaxWithholdingInstructionsToViewModel(th);
            expect(out).toEqual({
                dollarAmount: '',
                percentAmount: '',
                withholdMinimum: false,
                withholdNone: true,
            });
        });
    });

    describe('getOwnersTaxJurisdictionState', () => {
        it('returns state code when owner has STATE withholding with taxJurisdiction formatted as XX_YY', () => {
            const policy = {
                partyRoles: [{ partyRole: PartyRole.OWNER, partyId: 'P1' }],
                parties: [
                    {
                        partyId: 'P1',
                        taxWithholdings: [
                            {
                                taxWithholdingType: TaxWithholdingType.STATE,
                                taxJurisdiction: 'US_NY',
                            },
                        ],
                    },
                ],
            } as any;
            expect(getOwnersTaxJurisdictionState(policy)).toBe('NY');
        });

        it('returns DEFAULT_ERROR_STRING when format is invalid or missing', () => {
            const base = {
                partyRoles: [{ partyRole: PartyRole.OWNER, partyId: 'P1' }],
                parties: [{ partyId: 'P1', taxWithholdings: [] }],
            } as any;
            expect(getOwnersTaxJurisdictionState(base)).toBe(
                DEFAULT_ERROR_STRING
            );

            const badFormat = {
                partyRoles: [{ partyRole: PartyRole.OWNER, partyId: 'P1' }],
                parties: [
                    {
                        partyId: 'P1',
                        taxWithholdings: [
                            {
                                taxWithholdingType: TaxWithholdingType.STATE,
                                taxJurisdiction: 'USNY',
                            },
                        ],
                    },
                ],
            } as any;
            expect(getOwnersTaxJurisdictionState(badFormat)).toBe(
                DEFAULT_ERROR_STRING
            );
        });
    });
});
