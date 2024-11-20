import { i18n, I18n } from 'next-i18next';

import { WithdrawalQuoteResponse } from '@deps/components/side-sheet/side-sheet-transaction/withdrawal/types';
import { AdhocTaxWithholdingInstructions, TaxRateToUse, TaxWithheldAmount, TaxWithholdingType, Transaction } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { negativeNumberFormatify, numberFormatify, percentFormatify } from './numbers.helper';

export const getRequestedWithheldTaxesDisplay = (
    taxWithholdingInstructions: AdhocTaxWithholdingInstructions[] | undefined,
    withholdingType: TaxWithholdingType,
    emptyFormat: string | number,
): string => {
    const { t } = i18n as I18n;
    const withholding = taxWithholdingInstructions?.find(tw => tw.taxWithholdingType === withholdingType);

    if (!withholding && emptyFormat === DEFAULT_ERROR_STRING) {
        return DEFAULT_ERROR_STRING;
    } else if (!withholding && emptyFormat === 0) {
        return numberFormatify(emptyFormat);
    }

    if (withholding?.taxRateToUse === TaxRateToUse.USEDEFAULTTABLE) {
        if (withholdingType === TaxWithholdingType.FEDERAL) return t('withdrawals.summary.minRequiredPercent', { percent: '10' });
        else return t('withdrawals.summary.minRequired');
    }

    if (withholding?.taxRateToUse === TaxRateToUse.NOWITHHOLDINGELECTED) {
        return t('withdrawals.summary.doNotWithhold');
    }

    return withholding?.dollar ? numberFormatify(withholding.dollar) : percentFormatify(withholding?.percentage, { isInteger: true });
};

export const getReturnedWithheldTaxesDisplay = (
    taxWithheldAmounts: TaxWithheldAmount[],
    withholdingType: TaxWithholdingType,
    emptyFormat: string | number
): string => {
    const withheldAmount = taxWithheldAmounts?.find(tw => tw.taxWithholdingType === withholdingType);
    // @ts-expect-error API is returning withholdAmount instead of withheldAmount
    if (!withheldAmount?.withholdAmount && emptyFormat === DEFAULT_ERROR_STRING) {
        return DEFAULT_ERROR_STRING;
    // @ts-expect-error API is returning withholdAmount instead of withheldAmount
    } else if (!withheldAmount?.withholdAmount && emptyFormat === 0) {
        return numberFormatify(emptyFormat);
    }

    // @ts-expect-error API is returning withholdAmount instead of withheldAmount
    return negativeNumberFormatify(withheldAmount?.withholdAmount);
};

export const getTaxWithheldByType = (transaction: Transaction, taxWithholdingType: TaxWithholdingType, quote?: WithdrawalQuoteResponse): string => {
    const taxWithheldAmounts = quote
        ? quote.taxWithheldAmounts
        : transaction.taxWithheldAmounts;

    return getReturnedWithheldTaxesDisplay(taxWithheldAmounts || [], taxWithholdingType, 0);
}
