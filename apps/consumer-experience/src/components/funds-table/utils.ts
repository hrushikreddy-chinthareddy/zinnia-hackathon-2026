import { Fund } from '@/services/funds';

//TODO: Add testing for this function
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
