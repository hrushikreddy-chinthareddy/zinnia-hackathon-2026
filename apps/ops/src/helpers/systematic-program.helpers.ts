import { DisbursementPaymentForm, Frequency } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

export const getPaymentType = (paymentType: DisbursementPaymentForm | null, t: TFunction): string | null => {
    switch (paymentType) {
        case DisbursementPaymentForm.EFT:
            return t('payeeSummaryCard.paymentType.eft');
        case DisbursementPaymentForm.CHECK:
            return t('payeeSummaryCard.paymentType.check');
        default:
            return paymentType;
    }
};

export const getFrequency = (frequency: Frequency, t: TFunction): string => {
    switch (frequency) {
        case Frequency.ANNUAL:
            return t('systematicProgram.frequency.annual');
        case Frequency.DAILY:
            return t('systematicProgram.frequency.daily');
        case Frequency.EVERYTWOWEEKS:
            return t('systematicProgram.frequency.biAnnual');
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
