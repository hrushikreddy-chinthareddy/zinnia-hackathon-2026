import { TFunction } from 'next-i18next';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export const formatIllustrationDetailCurrency = (
    t: TFunction,
    value: number | null,
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
            <span className="typography-labels-label-sm-alt">{`.${fracSlice}`}</span>
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
            <span className="typography-labels-label-sm-alt">
                {t('clientCase.illustrationDetails.valuePerYear', {
                    value: `.${fracSlice}`,
                })}
            </span>
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
    ACH: 'clientCase.illustrationDetails.eft', // UI updated due to ZDR-3675
    CHECK: 'clientCase.illustrationDetails.check',
    EXCHANGE: 'clientCase.illustrationDetails.exchange',
    WIRE: 'clientCase.illustrationDetails.wire',
};
