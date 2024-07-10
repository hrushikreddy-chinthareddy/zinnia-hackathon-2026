import { TransactionSummaryItem } from './PaymentSummaryStep';

export const calculateTotalDeposit = (values: TransactionSummaryItem[]) => {
  const total = values.reduce((acc, total) => acc + total.value, 0);
  return total;
};
