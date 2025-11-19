import { cleanup } from '@testing-library/react';
import {
    AdhocTaxWithholdingInstructions,
    TaxRateToUse,
    TaxWithheldAmount,
    TaxWithholdingType,
    Transaction,
} from '@zinnia/api-types/types/sor';

jest.mock('next-i18next', () => {
    const t = (key: string, params?: Record<string, any>) => {
        if (key === 'withdrawals.summary.minRequiredPercent') {
            return `minRequiredPercent ${params?.percent ?? ''}`.trim();
        }
        if (key === 'withdrawals.summary.minRequired') return 'minRequired';
        if (key === 'withdrawals.summary.doNotWithhold') return 'doNotWithhold';
        return key;
    };
    return { i18n: { t } };
});

jest.mock('./numbers.helpers', () => ({
    numberFormatify: (n: number) => `num(${n})`,
    percentFormatify: (n?: number, opts?: any) =>
        `pct(${n}|${opts?.isInteger})`,
    negativeNumberFormatify: (n?: number) => `neg(${n})`,
}));

import {
    getRequestedWithheldTaxesDisplay,
    getTaxWithheldByType,
} from './tax-withholdings.helpers';

describe('helpers/tax-withholdings.helpers', () => {
    afterEach(() => cleanup());

    describe('getRequestedWithheldTaxesDisplay', () => {
        it('returns DEFAULT_ERROR_STRING or formatted zero when withholding not found', () => {
            const list: AdhocTaxWithholdingInstructions[] = [] as any;
            expect(
                getRequestedWithheldTaxesDisplay(
                    list,
                    TaxWithholdingType.FEDERAL,
                    '--'
                )
            ).toBe('--');
            expect(
                getRequestedWithheldTaxesDisplay(
                    list,
                    TaxWithholdingType.STATE,
                    0
                )
            ).toBe('num(0)');
        });

        it('returns minRequiredPercent for FEDERAL with USEDEFAULTTABLE, including percent when provided', () => {
            const list: AdhocTaxWithholdingInstructions[] = [
                {
                    taxWithholdingType: TaxWithholdingType.FEDERAL,
                    taxRateToUse: TaxRateToUse.USEDEFAULTTABLE,
                    percentage: 10,
                } as any,
            ];
            expect(
                getRequestedWithheldTaxesDisplay(
                    list,
                    TaxWithholdingType.FEDERAL,
                    0
                )
            ).toBe('minRequiredPercent (10%)');
        });

        it('returns minRequired for STATE with USEDEFAULTTABLE', () => {
            const list: AdhocTaxWithholdingInstructions[] = [
                {
                    taxWithholdingType: TaxWithholdingType.STATE,
                    taxRateToUse: TaxRateToUse.USEDEFAULTTABLE,
                } as any,
            ];
            expect(
                getRequestedWithheldTaxesDisplay(
                    list,
                    TaxWithholdingType.STATE,
                    0
                )
            ).toBe('minRequired');
        });

        it('returns doNotWithhold for NOWITHHOLDINGELECTED', () => {
            const list: AdhocTaxWithholdingInstructions[] = [
                {
                    taxWithholdingType: TaxWithholdingType.FEDERAL,
                    taxRateToUse: TaxRateToUse.NOWITHHOLDINGELECTED,
                } as any,
            ];
            expect(
                getRequestedWithheldTaxesDisplay(
                    list,
                    TaxWithholdingType.FEDERAL,
                    0
                )
            ).toBe('doNotWithhold');
        });

        it('returns numberFormatify when dollar provided; percentFormatify otherwise', () => {
            const withDollar: AdhocTaxWithholdingInstructions[] = [
                {
                    taxWithholdingType: TaxWithholdingType.STATE,
                    taxRateToUse: TaxRateToUse.USEVALUESENTERED,
                    dollar: 123.45,
                } as any,
            ];
            expect(
                getRequestedWithheldTaxesDisplay(
                    withDollar,
                    TaxWithholdingType.STATE,
                    0
                )
            ).toBe('num(123.45)');

            const withPercent: AdhocTaxWithholdingInstructions[] = [
                {
                    taxWithholdingType: TaxWithholdingType.STATE,
                    taxRateToUse: TaxRateToUse.USEVALUESENTERED,
                    percentage: 7,
                } as any,
            ];
            expect(
                getRequestedWithheldTaxesDisplay(
                    withPercent,
                    TaxWithholdingType.STATE,
                    0
                )
            ).toBe('pct(7|true)');
        });
    });

    describe('getTaxWithheldByType', () => {
        const tx = (amounts: TaxWithheldAmount[] = []): Transaction =>
            ({ taxWithheldAmounts: amounts } as any);

        it('uses transaction amounts when quote not provided and formats amount as negative', () => {
            const amounts: TaxWithheldAmount[] = [
                {
                    taxWithholdingType: TaxWithholdingType.FEDERAL,
                    withheldAmount: 50,
                } as any,
            ];
            expect(
                getTaxWithheldByType(tx(amounts), TaxWithholdingType.FEDERAL)
            ).toBe('neg(50)');
        });

        it('uses quote amounts when provided', () => {
            const quote = {
                taxWithheldAmounts: [
                    {
                        taxWithholdingType: TaxWithholdingType.STATE,
                        withheldAmount: 12,
                    },
                ],
            } as any;
            expect(
                getTaxWithheldByType(tx([]), TaxWithholdingType.STATE, quote)
            ).toBe('neg(12)');
        });

        it('formats zero when no amount found', () => {
            expect(getTaxWithheldByType(tx([]), TaxWithholdingType.STATE)).toBe(
                'num(0)'
            );
        });
    });
});
