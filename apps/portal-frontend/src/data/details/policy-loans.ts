import { LoanValues, Policy } from '@deps/models/policy/sor-policy';
import { DataDefinition } from '@deps/types/data';

export type LoanValuesDto = LoanValues;

export const toLoanValuesDto = (policy: Policy): LoanValuesDto => policy.loanValues as LoanValues;

export const PolicyLoansInfo = (): DataDefinition<LoanValuesDto>[] => [
    {
        key: 'totalLoanBalance',
        label: 'Total Loan Policy Balance',
    },
    {
        key: 'loanPayoffAmount',
        label: 'Loan Payoff Amount',
    },
    {
        key: 'maximumLoanAmount',
        label: 'Maximum Loan Amount',
    },
    {
        key: 'minimumLoanAmount',
        label: 'Minimum Loan Amount',
    },
    {
        key: 'lastLoanInterestDueDate',
        label: 'Last Loan Interest Due Date',
    },
    {
        key: 'totalNumberOfLoan',
        label: 'Total Number of Loan',
    },
];
