import { Transaction, TransactionType } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { getAccountTypeDisplay } from '@/components/paymentus/utils';
import { PaymentMethod } from '@/types/payment';
import { DEFAULT_DATE_FORMAT, sortByDate } from '@/utils/dates';

export interface TransactionPaymentInfo {
  paymentDescription: string; // Keep for backward compatibility
  paymentType: string; // 'Autopay' or 'One-time payment'
  accountType: string | null; // Raw account type for PII wrapping
  lastFourDigits: string; // Last 4 digits for PII wrapping
  formattedDate: string;
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

  const paymentMethod = paymentMethods?.find(
    method => method.bankId === bankId
  );

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

  const formattedDate = dayjs(transaction.effectiveDate).format(
    DEFAULT_DATE_FORMAT
  );

  // Determine payment type based on autopay status and transaction type
  const isAutopayPayment =
    hasActiveAutopay &&
    (transaction.transactionType === TransactionType.SUBSEQUENT_PREMIUM ||
      transaction.transactionType === TransactionType.SUBSEQUENT_PAYMENT ||
      transaction.transactionType === TransactionType.INITIAL_PREMIUM);

  const paymentType = isAutopayPayment ? 'Autopay' : 'One-time payment';

  const accountTypeFormatted = getAccountTypeDisplay(
    paymentMethod.accountType as PaymentMethod['type']
  );

  // Return null if account type cannot be determined (would show as "-")
  if (!accountTypeFormatted || accountTypeFormatted === '-') {
    return null;
  }

  const paymentDescription = `${paymentType} from ${accountTypeFormatted} ending in ${lastFourDigits} on ${formattedDate}`;

  return {
    paymentDescription, // Keep for backward compatibility
    paymentType,
    accountType: paymentMethod.accountType || null,
    lastFourDigits,
    formattedDate,
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

  const sortedTransactions = paymentTransactions.sort((a, b) =>
    sortByDate(a.effectiveDate, b.effectiveDate, { order: 'asc' })
  );

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
