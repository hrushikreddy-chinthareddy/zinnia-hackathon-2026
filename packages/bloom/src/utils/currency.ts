export const formatUSDollars = (val?: number | undefined) => {
  if (val === null || val === undefined || typeof val !== 'number') {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};
