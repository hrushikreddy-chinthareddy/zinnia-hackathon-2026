import {
    ArrangementType,
    SystematicProgram,
    Frequency,
    PaymentForm,
    Status,
} from '@zinnia/api-types/types/sor';

import { FooterContent } from '../card-section/card-section';

export interface SystematicProgramsCardProps {
    title: string;
    programs: {
        arrangementType: ArrangementType;
        activePrograms: SystematicProgram[];
        terminatedOrSuspendedPrograms: SystematicProgram[];
        manageAction?: FooterContent;
        cancelAction?: FooterContent;
    }[];
    setUpAction?: FooterContent;
}

export const arrangmentTypesDictionary: Record<ArrangementType, string> = {
    PAYMENT: 'Premium',
    LOANREPAYMENT: 'Loan Repayment',
    PAYOUT: 'Payout',
    REQUIREDMINIMUMDISTRIBUTION: 'RMD',
    WITHDRAWAL: 'Withdrawal',
};

export const frequencyDictionary: Record<Frequency | 'DEFAULT', string> = {
    DAILY: 'Daily',
    EVERYTWOWEEKS: 'Every 2 weeks',
    MONTHLY: 'Monthly',
    SEMIANNUAL: 'Biannual',
    QUARTERLY: 'Quarterly',
    ANNUAL: 'Annual',
    SINGLEPAYMENT: 'Single payment',
    DEFAULT: 'Monthly',
};

export const paymentFormDictionary: Record<PaymentForm, string> = {
    DTCC: 'DTCC',
    CREDITCARD: 'Credit card',
    ACH: 'ACH',
    CHECK: 'Check',
    WIRE: 'Wire',
    EXCHANGE: 'Exchange',
};

export const programStatusDictionary: Record<Status, string> = {
    ACTIVE: 'Active',
    TERMINATED: 'Terminated',
    PENDING: 'Pending',
    SUSPENDED: 'Suspended',
};

export enum SystematicProgramsCardTest {
    CONTAINER = 'systematic-programs-card-container-test-id',
}
