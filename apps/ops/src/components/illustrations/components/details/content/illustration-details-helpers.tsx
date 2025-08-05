import { TFunction } from 'next-i18next';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export const formatIllustrationDetailYearlyCurrency = (
    t: TFunction,
    value: number | string | null
) => {
    const formattedValue = numberFormatify(value);
    return (
        <>
            <span className="[font:var(--typography-content-body-bold)]">
                {formattedValue.slice(0, -3)}
            </span>
            {value
                ? t('clientCase.illustrationDetails.valuePerYear', {
                      value: formattedValue.slice(-3),
                  })
                : DEFAULT_ERROR_STRING}
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
