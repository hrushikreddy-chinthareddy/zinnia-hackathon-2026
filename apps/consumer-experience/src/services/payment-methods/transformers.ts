import { v4 as uuidv4 } from 'uuid';

import { BankDetail } from '@/components/person-data/types';
import { PaymentMethod } from '@/types/payment';
import { PaymentusProfile } from '@/types/paymentus';

export const transformPaymentusProfiles = (
  paymentMethods: PaymentusProfile[] | null
): PaymentMethod[] => {
  if (!paymentMethods) {
    return [];
  }

  return paymentMethods.map(paymentMethod => ({
    bankId: paymentMethod.token,
    branchName: paymentMethod['bank-name'],
    accountType: paymentMethod.type,
    accountNumber: paymentMethod['account-number'],
    type: paymentMethod.type,
    // @TODO: add party id (which party though?)
    appliesToPartyId: uuidv4().toString(),
    // @TODO: this will somehow come from BPM
    autopayEnabled: false,
    nameOnAccount: paymentMethod['card-holder-name'],
  }));
};

export const transformBankDetails = (
  bankDetails: BankDetail[] | null
): PaymentMethod[] => {
  if (!bankDetails) {
    return [];
  }

  return bankDetails.map(bankDetail => ({
    bankId: bankDetail.bankId,
    branchName: bankDetail.branchName,
    accountType: bankDetail.accountType,
    accountNumber: bankDetail.accountNumber,
    autopayEnabled: bankDetail.autopayEnabled,
    appliesToPartyId: bankDetail.appliesToPartyId,
    nameOnAccount: bankDetail.nameOnAccount,
  }));
};
