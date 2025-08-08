import { TFunction } from 'next-i18next';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export const formatIllustrationDetailCurrencyBold = (
    t: TFunction,
    value: number | null
) => {
    if (value == null) {
        return DEFAULT_ERROR_STRING;
    }
    const formattedValue = numberFormatify(value);

    const [intSlice, fracSlice = '00'] = formattedValue.split('.');

    return (
        <>
            <span className="typography-content-body-bold">{intSlice}</span>
            {`.${fracSlice}`}
        </>
    );
};

export const formatIllustrationDetailYearlyCurrency = (
    t: TFunction,
    value: number | string | null,
    bold?: boolean
) => {
    if (value == null) {
        return DEFAULT_ERROR_STRING;
    }
    const formattedValue = numberFormatify(value);

    const [intSlice, fracSlice = '00'] = formattedValue.split('.');

    return (
        <>
            <span
                className={
                    bold
                        ? 'typography-content-body-bold'
                        : 'typography-content-body'
                }
            >
                {intSlice}
            </span>
            {t('clientCase.illustrationDetails.valuePerYear', {
                value: `.${fracSlice}`,
            })}
        </>
    );
};

export const paymentFrequencies: Record<string, string> = {
    DAILY: 'clientCase.illustrationDetails.daily',
    EVERYTWOWEEKS: 'clientCase.illustrationDetails.every-two-weeks',
    MONTHLY: 'clientCase.illustrationDetails.monthly',
    SEMIANNUAL: 'clientCase.illustrationDetails.semi-annual',
    QUARTERLY: 'clientCase.illustrationDetails.quarterly',
    ANNUAL: 'clientCase.illustrationDetails.annual',
    SINGLEPAYMENT: 'clientCase.illustrationDetails.singlepayment',
};

export const paymentMethods: Record<string, string> = {
    DTCC: 'clientCase.illustrationDetails.dtcc',
    CREDITCARD: 'clientCase.illustrationDetails.creditcard',
    ACH: 'clientCase.illustrationDetails.ach',
    CHECK: 'clientCase.illustrationDetails.check',
    EXCHANGE: 'clientCase.illustrationDetails.exchange',
    WIRE: 'clientCase.illustrationDetails.wire',
};
