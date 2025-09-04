import {
    DisbursementPaymentForm,
    PaymentForm,
} from '@zinnia/api-types/types/bpm';
import { AccountType } from '@zinnia/api-types/types/sor';

export const getDisbursementPaymentForm = (
    paymentForm?: PaymentForm
): DisbursementPaymentForm => {
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

export const convertAggregationAccountTypeToPaymentForm = (
    accountType: string | AccountType | undefined
): PaymentForm | undefined => {
    if (!accountType) {
        return undefined;
    }

    // First check if the account type matches a payment form 1:1
    const matchesPaymentForm = Object.values(PaymentForm).find(
        (form) => accountType.toLowerCase() === form.toLowerCase()
    );

    if (matchesPaymentForm) {
        return matchesPaymentForm;
    }

    // If not, use the below mapping
    switch (accountType?.toLowerCase()) {
        case AccountType.CHECKING.toLowerCase():
        case AccountType.SAVINGS.toLowerCase():
            return PaymentForm.ACH;
        case AccountType.CREDITCARD.toLowerCase():
        case AccountType.DEBITCARD.toLowerCase():
            return PaymentForm.CREDITCARD;
        case AccountType.BROKERAGEACCOUNT.toLowerCase():
        case AccountType.CERTIFICATEOFDEPOSIT.toLowerCase():
            return PaymentForm.CHECK;
        default:
            return undefined;
    }
};
