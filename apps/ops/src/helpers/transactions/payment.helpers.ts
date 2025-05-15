import { DisbursementPaymentForm, PaymentForm } from '@zinnia/api-types/types/bpm';

export const getDisbursementPaymentForm = (paymentForm?: PaymentForm): DisbursementPaymentForm => {
    switch (paymentForm) {
        case PaymentForm.CHECK:
            return DisbursementPaymentForm.CHECK;
        case PaymentForm.WIRE:
            return DisbursementPaymentForm.WIRE;
        case PaymentForm.ACH:
        default:
            return DisbursementPaymentForm.ACH;
    }
};
