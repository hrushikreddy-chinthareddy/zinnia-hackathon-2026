import { Policy, PolicyStatus } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

export const determineWithdrawalsEligibility = ({
  policyStatus,
  accountValues,
  allocation,
  withdrawalValues,
}: Policy): {
  isEligibleForWithdrawals: boolean;
  annualWithdrawalsTaken: number | null;
  annualWithdrawalsRemaining: number;
} => {
  let allowedAnnualWithdrawals = 0;

  // Eligibility Checks
  const eligiblePolicyStatus =
    policyStatus &&
    [PolicyStatus.ACTIVE, PolicyStatus.PENDINGLAPSE].includes(policyStatus);
  const eligibleSurrenderValue =
    accountValues?.surrenderValue && accountValues.surrenderValue > 0;
  const eligibleAccountValue =
    accountValues?.beginningAccountValue &&
    accountValues?.beginningAccountValue > 0;

  const matchVestingDate = allocation?.matchSegment?.matchVestingDate;

  if (
    eligiblePolicyStatus &&
    eligibleSurrenderValue &&
    eligibleAccountValue &&
    matchVestingDate
  ) {
    allowedAnnualWithdrawals = dayjs(matchVestingDate).isBefore(dayjs())
      ? 12
      : 1;
  }

  const withdrawalsTaken =
    withdrawalValues?.totalYearToDateWithdrawalTaken !== undefined
      ? withdrawalValues.totalYearToDateWithdrawalTaken
      : null;

  return {
    isEligibleForWithdrawals:
      withdrawalsTaken === null
        ? true
        : allowedAnnualWithdrawals > withdrawalsTaken,
    annualWithdrawalsTaken: withdrawalsTaken,
    annualWithdrawalsRemaining:
      withdrawalsTaken != null
        ? Math.max(0, allowedAnnualWithdrawals - withdrawalsTaken)
        : 0,
  };
};
