import { PaymentusAccountType } from '@/types/paymentus';

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
