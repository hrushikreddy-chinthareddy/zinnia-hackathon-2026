import { i18n, I18n } from 'next-i18next';

import { WithdrawalQuoteResponse } from '@deps/components/side-sheet/side-sheet-transaction/withdrawal/types';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    AdhocTaxWithholdingInstructions,
    TaxRateToUse,
    TaxWithheldAmount,
    TaxWithholdingType,
    Transaction,
} from '@zinnia/api-types/types/sor';

import {
    negativeNumberFormatify,
    numberFormatify,
    percentFormatify,
} from '../numbers.helpers';

export const getRequestedWithheldTaxesDisplay = (
    taxWithholdingInstructions: AdhocTaxWithholdingInstructions[] | undefined,
    withholdingType: TaxWithholdingType,
    emptyFormat: string | number
): string => {
    const { t } = i18n as I18n;
    const withholding = taxWithholdingInstructions?.find(
        (tw) => tw.taxWithholdingType === withholdingType
    );

    if (!withholding && emptyFormat === DEFAULT_ERROR_STRING) {
        return DEFAULT_ERROR_STRING;
    } else if (!withholding && emptyFormat === 0) {
        return numberFormatify(emptyFormat);
    }

    if (withholding?.taxRateToUse === TaxRateToUse.USEDEFAULTTABLE) {
        if (withholdingType === TaxWithholdingType.FEDERAL)
            return t('withdrawals.summary.minRequiredPercent', {
                percent: '10',
            });
        else return t('withdrawals.summary.minRequired');
    }

    if (withholding?.taxRateToUse === TaxRateToUse.NOWITHHOLDINGELECTED) {
        return t('withdrawals.summary.doNotWithhold');
    }

    return withholding?.dollar
        ? numberFormatify(withholding.dollar)
        : percentFormatify(withholding?.percentage, { isInteger: true });
};

export const getReturnedWithheldTaxesDisplay = (
    taxWithheldAmounts: TaxWithheldAmount[],
    withholdingType: TaxWithholdingType,
    emptyFormat: string | number
): string => {
    // FIXME: This is a hack TS compile, since the property coming back from BPM is wrong
    // When bpm fixes the property to the correct `withheldAmount`, this should be removed
    type BPMWithheldAmount = TaxWithheldAmount & {
        withholdAmount: TaxWithheldAmount['withheldAmount'];
    };
    const withheldAmount: BPMWithheldAmount | undefined = taxWithheldAmounts?.find(
        (tw) => tw.taxWithholdingType === withholdingType
    ) as BPMWithheldAmount | undefined;
    if (
        !withheldAmount?.withholdAmount &&
        emptyFormat === DEFAULT_ERROR_STRING
    ) {
        return DEFAULT_ERROR_STRING;
    } else if (!withheldAmount?.withholdAmount && emptyFormat === 0) {
        return numberFormatify(emptyFormat);
    }

    return negativeNumberFormatify(withheldAmount?.withholdAmount);
};

export const getTaxWithheldByType = (
    transaction: Transaction,
    taxWithholdingType: TaxWithholdingType,
    quote?: WithdrawalQuoteResponse
): string => {
    const taxWithheldAmounts = quote
        ? (quote.taxWithheldAmounts as TaxWithheldAmount[])
        : transaction.taxWithheldAmounts;

    return getReturnedWithheldTaxesDisplay(
        taxWithheldAmounts || [],
        taxWithholdingType,
        0
    );
};
