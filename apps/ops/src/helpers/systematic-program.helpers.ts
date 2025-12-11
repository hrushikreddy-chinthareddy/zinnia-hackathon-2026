import { TFunction } from 'next-i18next';

import {
    DisbursementPaymentForm,
    Frequency,
    PaymentForm,
} from '@zinnia/api-types/types/sor';

export const getPaymentType = (
    paymentType: DisbursementPaymentForm | PaymentForm | null,
    t: TFunction
): string | null => {
    if (!paymentType) return null;
    return t([
        `payeeSummaryCard.paymentType.${paymentType.toLowerCase()}`,
        paymentType,
    ]);
};

export const getFrequency = (frequency: Frequency, t: TFunction): string => {
    switch (frequency) {
        case Frequency.ANNUAL:
            return t('systematicProgram.frequency.annual');
        case Frequency.DAILY:
            return t('systematicProgram.frequency.daily');
        case Frequency.EVERYTWOWEEKS:
            return t('systematicProgram.frequency.everyTwoWeeks');
        case Frequency.MONTHLY:
            return t('systematicProgram.frequency.monthly');
        case Frequency.SEMIANNUAL:
            return t('systematicProgram.frequency.semiAnnual');
        case Frequency.SINGLEPAYMENT:
            return t('systematicProgram.frequency.oneTime');
        case Frequency.QUARTERLY:
            return t('systematicProgram.frequency.quarterly');
        default:
            return '';
    }
};
