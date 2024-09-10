import { t } from 'i18next';

import { DisbursementPaymentForm } from '@deps/models/policy/sor-policy';

import { getPaymentType } from './systematic-program.helper';

describe('getPaymentType', () => {
    it('should return correct payment Type', () => {
        const payment = DisbursementPaymentForm.CHECK;
        const paymentType = getPaymentType(payment, t);

        expect(paymentType).toBe(t('payeeSummaryCard.paymentType.check'));
    });
});
