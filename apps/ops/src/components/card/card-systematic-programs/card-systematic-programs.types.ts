import {
    ArrangementType,
    SystematicProgram,
    Frequency,
    PaymentForm,
    Status,
} from '@zinnia/api-types/types/sor';

import { FooterContent } from '../card-section/card-section';

export interface SystematicProgramsDetails {
    arrangementType: ArrangementType;
    activePrograms: SystematicProgram[];
    terminatedOrSuspendedPrograms: SystematicProgram[];
    manageAction?: FooterContent;
    cancelAction?: FooterContent;
}

export interface SystematicProgramsCardProps {
    programs: SystematicProgramsDetails[];
    setUpAction?: FooterContent;
}

export interface SystematicProgramsActiveTableProps {
    programs: SystematicProgramsDetails[];
    hasActivePrograms: boolean;
}
export interface SystematicProgramsTerminatedTableProps {
    programs: SystematicProgramsDetails[];
    hasTerminatedOrSuspendedPrograms: boolean;
    showTerminatedOrSuspended: boolean;
}

export const arrangmentTypesDictionary: Record<ArrangementType, string> = {
    PAYMENT: 'Premium',
    LOANREPAYMENT: 'Loan repayment',
    PAYOUT: 'Payout',
    REQUIREDMINIMUMDISTRIBUTION: 'RMD',
    WITHDRAWAL: 'Withdrawal',
};

export const arrangmentTypesMsgDictionary: Record<ArrangementType, string> = {
    PAYMENT: 'premium',
    LOANREPAYMENT: 'loan repayment',
    PAYOUT: 'payout',
    REQUIREDMINIMUMDISTRIBUTION: 'RMD',
    WITHDRAWAL: 'withdrawal',
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
