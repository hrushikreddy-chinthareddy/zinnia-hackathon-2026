import { TransactionSummaryItem } from './PaymentSummaryStep';

export const calculateTotalDeposit = (values: TransactionSummaryItem[]) =>
  values.reduce((acc, total) => (total.value ? acc + total.value : acc), 0);
