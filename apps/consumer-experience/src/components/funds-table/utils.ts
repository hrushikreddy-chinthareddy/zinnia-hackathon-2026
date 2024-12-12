import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { Fund } from '@/services/funds';

export const sortNonHoldingFunds = (funds: Fund[] | undefined) => {
  if (!funds) {
    return [];
  }

  return [...funds].sort((a, b) => {
    // elected funds first
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    const isAElected = a.isElected;
    const isBElected = b.isElected;
    if (isAElected && !isBElected) return -1;
    if (!isAElected && isBElected) return 1;
    // elected funds sorted by allocation percentage
    if (isAElected && isBElected) {
      return (b.allocationPercentage ?? 0) - (a.allocationPercentage ?? 0);
    }
    // the rest sorted alphabetically
    return (a.fundName || '').localeCompare(b.fundName || '');
  });
};

export const sweepDateInfo = (lineOfBusiness?: LineOfBusiness) => {
  switch (lineOfBusiness) {
    case LineOfBusiness.ANNUITY:
      return "On this date, all money in the holding account will be “swept” or moved into the account(s) or fund(s) you've elected. In most cases, the sweep date happens on the same date every month.";
    default:
      return "On this date, all money in the holding account will be “swept” or moved into the account(s) you've elected. In most cases, the sweep date happens on the same date every month.";
  }
};

export const allocationAccountInfo = (lineOfBusiness?: LineOfBusiness) => {
  switch (lineOfBusiness) {
    case LineOfBusiness.ANNUITY:
      return 'This is the amount of your account value currently allocated in this specific account or fund.';
    default:
      return 'This is the amount of your account value currently allocated in this specific account.';
  }
};
