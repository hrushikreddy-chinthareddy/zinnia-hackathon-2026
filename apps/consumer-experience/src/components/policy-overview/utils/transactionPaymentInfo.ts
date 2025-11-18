import { Transaction } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { PaymentMethod } from '@/types/payment';

export interface TransactionPaymentInfo {
  paymentDescription: string;
  bankId: string | null;
  accountNumber: string | null;
  transactionType: string | null;
  effectiveDate: string | null;
}

/**
 * Combines transaction data with payment method data to create a formatted payment description
 * @param transaction - The transaction object containing payors information
 * @param paymentMethods - Array of payment methods to match against
 * @param hasActiveAutopay - Whether there's an active autopay arrangement
 * @returns Formatted payment information including description string
 */
export function getTransactionPaymentInfo(
  transaction: Transaction,
  paymentMethods: PaymentMethod[],
  hasActiveAutopay?: boolean
): TransactionPaymentInfo | null {
  const bankId = transaction.payors?.[0]?.bankId || null;

  if (!bankId) {
    return null;
  }

  const paymentMethod = paymentMethods.find(method => method.bankId === bankId);

  if (!paymentMethod) {
    return null;
  }

  const accountNumber = paymentMethod.accountNumber;
  if (!accountNumber) {
    return null;
  }
  const lastFourDigits = accountNumber.slice(-4);

  if (!transaction.effectiveDate) {
    return null;
  }

  const formattedDate = dayjs(transaction.effectiveDate).format('M/D/YY');

  // Determine payment type based on autopay status and transaction type
  const isAutopayPayment =
    hasActiveAutopay &&
    (transaction.transactionType === 'SubsequentPremium' ||
      transaction.transactionType === 'SubsequentPayment' ||
      transaction.transactionType === 'InitialPremium');

  const paymentType = isAutopayPayment ? 'Autopay' : 'One-time payment';

  const accountTypeFormatted =
    paymentMethod.accountType?.toLowerCase() || 'account';
  const paymentDescription = `${paymentType} from ${accountTypeFormatted} ending in ${lastFourDigits} on ${formattedDate}`;

  return {
    paymentDescription,
    bankId,
    accountNumber: accountNumber || null,
    transactionType: transaction.transactionType || null,
    effectiveDate: transaction.effectiveDate || null,
  };
}

/**
 * Gets payment info for the most recent transaction with payment details
 * @param transactions - Array of transactions
 * @param paymentMethods - Array of payment methods
 * @param hasActiveAutopay - Whether there's an active autopay arrangement
 * @returns Payment info for the most recent transaction with payors, or null if none found
 */
export function getMostRecentTransactionPaymentInfo(
  transactions: Transaction[],
  paymentMethods: PaymentMethod[],
  hasActiveAutopay?: boolean
): TransactionPaymentInfo | null {
  const paymentTransactions = transactions.filter(
    transaction => transaction.payors && transaction.payors.length > 0
  );

  if (paymentTransactions.length === 0) {
    return null;
  }

  const sortedTransactions = paymentTransactions.sort((a, b) => {
    const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timestampB - timestampA;
  });

  const mostRecentTransaction = sortedTransactions[0];

  if (!mostRecentTransaction) {
    return null;
  }

  return getTransactionPaymentInfo(
    mostRecentTransaction,
    paymentMethods,
    hasActiveAutopay
  );
}
