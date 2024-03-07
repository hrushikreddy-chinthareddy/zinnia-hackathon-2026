import { DEFAULT_ERROR_STRING } from './strings';

export const formatUSDollars = (val?: number | null) => {
  if (val === null || val === undefined || typeof val !== 'number') {
    return DEFAULT_ERROR_STRING;
  }

  if (val === 0) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};
