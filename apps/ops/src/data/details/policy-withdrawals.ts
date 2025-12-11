import { DataDefinition } from '@deps/types/data';
import { Policy, WithdrawalValues } from '@zinnia/api-types/types/sor';

export type WithdrawalValuesDto = WithdrawalValues;

export const toWithdrawalValuesDto = (policy: Policy): WithdrawalValuesDto =>
    policy.withdrawalValues as WithdrawalValues;

export const PolicyWithdrawalsInfo =
    (): DataDefinition<WithdrawalValuesDto>[] => [
        {
            key: 'totalWithdrawalAmount',
            label: 'Total Withdrawal Amount',
        },
        {
            key: 'minimumWithdrawalAmount',
            label: 'Min Withdrawal Amount',
        },
        {
            key: 'maximumWithdrawalAmount',
            label: 'Max Withdrawal Amount',
        },
        {
            key: 'annualWithdrawalLimitNoCoverageDecrease',
            label: 'Annual Withdrawal Limit for No Coverage Decrease',
        },
        {
            key: 'maximumWithdrawalRequestDuringVestingPeriod',
            label: 'Max Withdrawal Request Allowed During Vesting Period',
        },
        {
            key: 'maximumWithdrawalRequestAfterVestingPeriod',
            label: 'Max Withdrawal Request Allowed After Vesting Period',
        },
        {
            key: 'totalYearToDateWithdrawalTaken',
            label: 'YTD Withdrawal Taken',
        },
        {
            key: 'numberOfWithdrawal',
            label: 'Number of Withdrawal',
        },
    ];
