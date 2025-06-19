import { PaymentusAccountType } from '@/types/paymentus';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

// translate the account type enum into a ui-friendly string value
export const accountType: Record<PaymentusAccountType, string> = {
  [PaymentusAccountType.VISA]: 'Visa',
  [PaymentusAccountType.MC]: 'MasterCard',
  [PaymentusAccountType.AMEX]: 'American Express',
  [PaymentusAccountType.CHQ]: 'Checking Account',
  [PaymentusAccountType.SAV]: 'Savings Account',
  [PaymentusAccountType.VISA_DEBIT]: 'Visa (debit)',
  [PaymentusAccountType.MC_DEBIT]: 'MasterCard (debit)',
  [PaymentusAccountType.DISC]: 'Discover',
  [PaymentusAccountType.DISC_DEBIT]: 'Discover (debit)',
  [PaymentusAccountType.PD]: 'ATM Card',
  [PaymentusAccountType.WALKIN_CASH]: 'Walkin Cash',
  [PaymentusAccountType.IONLINE]: 'INTERAC Online',
  [PaymentusAccountType.IPPPAYS_KIOSK_CASH]: 'IPPPays Kiosk Cash',
  [PaymentusAccountType.AP]: 'Apple Pay',
  [PaymentusAccountType.GP]: 'Google Pay',
  [PaymentusAccountType.PAYPAL_ACCOUNT]: 'PayPal',
  [PaymentusAccountType.PAYPAL_CREDIT]: 'PayPal Credit',
  [PaymentusAccountType.VENMO]: 'Venmo',
  [PaymentusAccountType.AMAZON_PAY]: 'Amazon Pay',
  [PaymentusAccountType.WALMART_PAY]: 'Walmart Pay',
};

export const creditCardAccountTypes: PaymentusAccountType[] = [
  PaymentusAccountType.VISA,
  PaymentusAccountType.MC,
  PaymentusAccountType.AMEX,
  PaymentusAccountType.DISC,
];

/**
 * Get the branch name based on the paymentItem type.
 * If paymentItem is a credit card, show 'VISA' or 'MASTERCARD', etc.
 * If paymentItem is a bank account, show the name of the bank
 * Otherwise show the type of the account
 * @param {PaymentusProfile} paymentItem - The payment item to get the branch name from
 * @returns {string} The branch name
 */
export const getBranchName = ({
  type,
  bankName,
}: {
  type: PaymentusAccountType;
  bankName?: string;
}) => {
  if ([PaymentusAccountType.CHQ, PaymentusAccountType.SAV].includes(type)) {
    return bankName || DEFAULT_ERROR_STRING;
  }

  return accountType[type];
};

export const getAccountTypeDisplay = (paymentType: PaymentusAccountType) => {
  if (paymentType.toLowerCase().includes('debit')) {
    return 'Debit Card';
  }
  if (creditCardAccountTypes.includes(paymentType)) {
    return 'Credit Card';
  }
  if (paymentType === PaymentusAccountType.CHQ) {
    return 'Checking';
  }
  if (paymentType === PaymentusAccountType.SAV) {
    return 'Savings';
  }
  return DEFAULT_ERROR_STRING;
};
