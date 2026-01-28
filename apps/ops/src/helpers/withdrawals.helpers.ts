import dayjs from 'dayjs';

import { Policy, PolicyChargeType } from '@zinnia/api-types/types/sor';

interface MapWithdrawalsSubPage {
    isEligible: boolean;
    policy: Policy;
}

export interface WithdrawalsValues {
    amountEligibleForWithdrawal?: number;
    netSurrenderValue?: number;
    annualWithdrawalsRemaining: number;
    annualWithdrawalsTaken: number | null;
    allTimeWithdrawalAmount?: number;
    allTimeWithdrawalCount?: number;
    freeWithdrawalAmount?: number;
    maximumWithdrawalAmount?: number;
    marketValueAdjustmentIndicator?: boolean;
    marketValueAdjustmentAmount?: number;
    yearToDateFreeWithdrawalAmount?: number;
    totalYearToDateWithdrawalTaken?: number;
}

export const mapWithdrawalsSubPage = ({
    isEligible,
    policy,
}: MapWithdrawalsSubPage): WithdrawalsValues => {
    const {
        accountValues,
        allocation,
        charges,
        withdrawalValues,
        marketValueAdjustment,
    } = policy;

    let allowedAnnualWithdrawals = 0;

    const mvaChargeType = charges?.find(
        (charge) => charge.chargeType === PolicyChargeType.MARKETVALUEADJUSTMENT
    );

    const eligibleAccountValue =
        Number(accountValues?.beginningAccountValue) > 0;
    const eligibleSurrenderValue = Number(accountValues?.surrenderValue) > 0;
    const matchVestingDate = allocation?.matchSegment?.matchVestingDate;
    const withdrawalsTaken =
        withdrawalValues?.yearToDateNumberOfWithdrawal ?? null;

    if (
        isEligible &&
        eligibleSurrenderValue &&
        eligibleAccountValue &&
        matchVestingDate
    ) {
        allowedAnnualWithdrawals = dayjs(matchVestingDate).isBefore(dayjs())
            ? 12
            : 1;
    }

    return {
        allTimeWithdrawalAmount: withdrawalValues?.totalWithdrawalAmount,
        allTimeWithdrawalCount: withdrawalValues?.numberOfWithdrawal,
        amountEligibleForWithdrawal: withdrawalValues?.maximumWithdrawalAmount,
        annualWithdrawalsRemaining:
            withdrawalsTaken != null
                ? Math.max(0, allowedAnnualWithdrawals - withdrawalsTaken)
                : 0,
        annualWithdrawalsTaken: withdrawalsTaken,
        netSurrenderValue: accountValues?.surrenderValue,
        freeWithdrawalAmount: withdrawalValues?.freeWithdrawalAmount,
        maximumWithdrawalAmount: withdrawalValues?.maximumWithdrawalAmount,
        marketValueAdjustmentIndicator:
            !!marketValueAdjustment?.marketValueAdjustmentIndicator,
        marketValueAdjustmentAmount: mvaChargeType?.uncollectedPerCharge,
        yearToDateFreeWithdrawalAmount:
            withdrawalValues?.yearToDateFreeWithdrawalAmount,
        totalYearToDateWithdrawalTaken:
            withdrawalValues?.totalYearToDateWithdrawalTaken,
    };
};
