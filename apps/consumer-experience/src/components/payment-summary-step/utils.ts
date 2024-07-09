export const calculateTotalDeposit = (
  values: Array<{ label: string; value: number }>
) => {
  const total = values.reduce((acc, total) => acc + total.value, 0);
  return total;
};
