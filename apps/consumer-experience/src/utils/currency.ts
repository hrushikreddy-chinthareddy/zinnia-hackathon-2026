import { DEFAULT_ERROR_STRING } from './strings';

export const formatUSDollars = (
  val?: number | null | string,
  displayNullAsZero?: boolean
) => {
  const zeroDisplay = '$0';

  if (val === null || val === undefined || typeof val !== 'number') {
    if (displayNullAsZero) {
      return zeroDisplay;
    }

    return DEFAULT_ERROR_STRING;
  }

  if (val === 0) {
    return zeroDisplay;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};
