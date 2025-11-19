import { cleanup } from '@testing-library/react';
import {
    DisbursementPaymentForm,
    PaymentForm,
} from '@zinnia/api-types/types/bpm';
import { AccountType } from '@zinnia/api-types/types/sor';

import {
    convertAggregationAccountTypeToPaymentForm,
    getDisbursementPaymentForm,
} from './payment.helpers';

describe('helpers/transactions/payment.helpers', () => {
    afterEach(() => cleanup());

    describe('getDisbursementPaymentForm', () => {
        it('returns ACH as default when payment form is undefined', () => {
            expect(getDisbursementPaymentForm(undefined)).toBe(
                DisbursementPaymentForm.ACH
            );
        });

        it('maps PaymentForm.ACH to DisbursementPaymentForm.ACH', () => {
            expect(getDisbursementPaymentForm(PaymentForm.ACH)).toBe(
                DisbursementPaymentForm.ACH
            );
        });

        it('maps PaymentForm.CHECK to DisbursementPaymentForm.CHECK', () => {
            expect(getDisbursementPaymentForm(PaymentForm.CHECK)).toBe(
                DisbursementPaymentForm.CHECK
            );
        });

        it('maps PaymentForm.WIRE to DisbursementPaymentForm.WIRE', () => {
            expect(getDisbursementPaymentForm(PaymentForm.WIRE)).toBe(
                DisbursementPaymentForm.WIRE
            );
        });
    });

    describe('convertAggregationAccountTypeToPaymentForm', () => {
        it('returns undefined when input is undefined', () => {
            expect(convertAggregationAccountTypeToPaymentForm(undefined)).toBe(
                undefined
            );
        });

        it('returns PaymentForm by 1:1 direct match (case-insensitive)', () => {
            expect(convertAggregationAccountTypeToPaymentForm('ach')).toBe(
                PaymentForm.ACH
            );
            expect(convertAggregationAccountTypeToPaymentForm('WIRE')).toBe(
                PaymentForm.WIRE
            );
            expect(convertAggregationAccountTypeToPaymentForm('check')).toBe(
                PaymentForm.CHECK
            );
            expect(
                convertAggregationAccountTypeToPaymentForm('CREDITCARD')
            ).toBe(PaymentForm.CREDITCARD);
        });

        it('maps checking/savings to ACH', () => {
            expect(
                convertAggregationAccountTypeToPaymentForm(AccountType.CHECKING)
            ).toBe(PaymentForm.ACH);
            expect(
                convertAggregationAccountTypeToPaymentForm(AccountType.SAVINGS)
            ).toBe(PaymentForm.ACH);
        });

        it('maps credit or debit card to CREDITCARD', () => {
            expect(
                convertAggregationAccountTypeToPaymentForm(
                    AccountType.CREDITCARD
                )
            ).toBe(PaymentForm.CREDITCARD);
            expect(
                convertAggregationAccountTypeToPaymentForm(
                    AccountType.DEBITCARD
                )
            ).toBe(PaymentForm.CREDITCARD);
        });

        it('maps brokerage account or CD to CHECK', () => {
            expect(
                convertAggregationAccountTypeToPaymentForm(
                    AccountType.BROKERAGEACCOUNT
                )
            ).toBe(PaymentForm.CHECK);
            expect(
                convertAggregationAccountTypeToPaymentForm(
                    AccountType.CERTIFICATEOFDEPOSIT
                )
            ).toBe(PaymentForm.CHECK);
        });

        it('returns undefined for unknown account types', () => {
            expect(convertAggregationAccountTypeToPaymentForm('unknown')).toBe(
                undefined
            );
        });
    });
});
