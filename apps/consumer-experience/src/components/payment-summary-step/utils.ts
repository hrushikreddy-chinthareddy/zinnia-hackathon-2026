import { TransactionSummaryItem } from './PaymentSummaryStep';

export const calculateTotalDeposit = (values: TransactionSummaryItem[]) =>
  values.reduce((acc, total) => acc + total.value, 0);
