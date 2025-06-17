'use client';

import { FC } from 'react';

import { BankData } from '@/components/bank-data/BankData';
import { PaymentusAccountType, PaymentusProfile } from '@/types/paymentus';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

import { accountType, creditCardAccountTypes } from './utils';

interface PaymentProfilesListProps {
  profiles: PaymentusProfile[];
  verifyIdentityRequired?: boolean;
}

export const PaymentProfilesList: FC<PaymentProfilesListProps> = ({
  profiles,
  verifyIdentityRequired = false,
}) => {
  /**
   * Get the branch name based on the paymentItem type.
   * If paymentItem is a credit card, show 'VISA' or 'MASTERCARD', etc.
   * If paymentItem is a bank account, show the name of the bank
   * Otherwise show the type of the account
   * @param {PaymentusProfile} paymentItem - The payment item to get the branch name from
   * @returns {string} The branch name
   */
  const getBranchName = (paymentItem: PaymentusProfile) => {
    const { type, 'bank-name': bankName } = paymentItem;

    if ([PaymentusAccountType.CHQ, PaymentusAccountType.SAV].includes(type)) {
      return bankName;
    }

    return accountType[type];
  };

  const getAccountTypeDisplay = (paymentType: PaymentusAccountType) => {
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

  const renderBankData = (paymentItem: PaymentusProfile) => {
    // If the paymentItem is a credit card then show 'VISA' or 'MASTERCARD', etc.
    // Otherwise (if it's an bank account), show the name of bank.
    const branchName = getBranchName(paymentItem);

    return (
      <div key={`${paymentItem.token}`}>
        <BankData
          numberOfAccounts={profiles.length}
          accountNumber={paymentItem['account-number']}
          accountType={getAccountTypeDisplay(paymentItem.type)}
          editBankEnabled={true}
          checkVerification={verifyIdentityRequired}
          branchName={branchName}
          nameOnAccount={paymentItem['card-holder-name']}
        />
      </div>
    );
  };
  return (
    <div className="info-card-container">{profiles.map(renderBankData)}</div>
  );
};
