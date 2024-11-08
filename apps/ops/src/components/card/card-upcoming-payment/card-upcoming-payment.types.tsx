import { ReactNode } from 'react';

import { BankAccount } from '@deps/models/policy/sor-policy';
import { ClassNameProps } from '@deps/types/props';

import { FooterContent } from '../card-section/card-section';
import { AdditionalCharge } from '../card-transactions/card-transactions';

export enum UpcomingPaymentCardTest {
    CONTAINER = 'upcoming-payment-card-container-test-id',
    ACTIVE = 'upcoming-payment-card-active-test-id',
    INACTIVE = 'upcoming-payment-card-inactive-test-id',
    TRANSACTIONS = 'upcoming-payment-card-transactions-test-id',
}

export type UpcomingPaymentCardProps = {
    title?: string;
    titleCase?: boolean;
    icon?: ReactNode;
    // inactive content
    inactiveText?: string;
    inactiveHeaderText?: string;
    inactiveIcon?: ReactNode;
    inactiveContent?: ReactNode;
    // payment data
    paymentText?: string;
    paymentDate?: string;
    paymentDateText?: string;
    bankDetails?: BankAccount;
    // card-transactions-props
    paymentFrequencyText?: string;
    monthlyAmount?: number;
    additionalChargesTitle?: string;
    additionalCharges?: AdditionalCharge[];
    // manage bar props
    autopayText?: string;
    oneTimePaymentText?: string;
    startLoanText?: string;
    footerLinks: FooterContent[];
} & ClassNameProps;
