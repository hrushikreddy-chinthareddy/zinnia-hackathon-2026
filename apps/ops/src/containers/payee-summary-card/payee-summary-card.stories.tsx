import { Meta, StoryObj } from '@storybook/react';

import { toSentenceCase } from '@deps/helpers/string.helpers';
import { DisbursementPaymentForm, DisbursementType } from '@deps/models/policy/sor-policy';

import PayeeSummaryCard, { PayeeSummaryCardProps } from './payee-summary-card';

export default {
    title: 'Containers/PayeeSummaryCard',
    component: PayeeSummaryCard,
    args: {
        beneficiaryColor: false,
        index: 0,
        payeeName: 'Hubert Wolfeschlegelsteinhausenbergerdorff',
        requestedAmountDollarAmount: '$5,000.00',
        requestedAmountPercentage: '10%',
        withdrawalChargePercentage: '(15%)',
        withdrawalChargeDollarAmount: '($750.00)',
        federalTaxDollarAmount: '($500.00)',
        federalTaxPercentage: '(10%)',
        stateTaxDollarAmount: '($250)',
        stateTaxPercentage: '(5%)',
        totalAllocationAmount: '$4,875.00',
        branchName: 'PNC Bank',
        accountNumber: '123456789',
        disbursementType: toSentenceCase(DisbursementType.GROSS),
        paymentType: DisbursementPaymentForm.CHECK,
        showFinancialData: false,
        address: {
            startDate: '2023-03-28',
            endDate: '',
            addressType: 'RESIDENCE',
            addressLine1: '78 BOWERS STREET',
            addressLine2: '',
            addressLine3: '',
            city: 'BELLEMEAD',
            state: 'NJ',
            zipCode: '08502',
            zipCodeExtension: '',
            country: 'US',
            prefAddressInd: '1',
        },
    },
    argTypes: {
        paymentType: { control: 'inline-radio', options: [DisbursementPaymentForm.CHECK, DisbursementPaymentForm.ACH] },
        disbursementType: { control: 'inline-radio', options: [DisbursementType.GROSS, DisbursementType.NET].map(toSentenceCase) },
    },
} as Meta<typeof PayeeSummaryCard>;

type StoryType = StoryObj<PayeeSummaryCardProps>;

export const Default: StoryType = {
    args: {
        payeeName: 'Hubert Wolf',
    },
};
export const Detail: StoryType = {
    args: {
        paymentType: DisbursementPaymentForm.ACH,
        showFinancialData: true,
    },
};

export const ZeroCharges: StoryType = {
    args: {
        stateTaxDollarAmount: '$0',
        stateTaxPercentage: '0%',
        federalTaxDollarAmount: '$0',
        federalTaxPercentage: '0%',
        showFinancialData: true,
    },
};
