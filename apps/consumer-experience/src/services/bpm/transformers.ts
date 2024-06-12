import { TransactionResponse } from '@zinnia/api-types/types/bpm';

import { eligibilityStatus } from '@/utils/data';

// TODO: fix response type
export const transformEligibility = (eligibility: TransactionResponse): any => {
  return {
    isEligible: eligibilityStatus(eligibility),
    reason: eligibility.error,
  };
};
