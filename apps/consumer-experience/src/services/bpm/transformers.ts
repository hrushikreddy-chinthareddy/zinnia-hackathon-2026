import { TransactionResponse } from '@zinnia/api-types/types/bpm';

import { TransactionEligbility } from '@/types/transactions';
import { eligibilityStatus } from '@/utils/data';

export const transformEligibility = (
  eligibility: TransactionResponse
): TransactionEligbility => {
  return {
    isEligible: eligibilityStatus(eligibility),
    reason: eligibility.error,
  };
};
