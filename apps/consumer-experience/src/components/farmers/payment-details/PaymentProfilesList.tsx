'use client';

import { FC } from 'react';

import { BankData } from '@/components/bank-data/BankData';
import {
  getAccountTypeDisplay,
  getBranchName,
} from '@/components/paymentus/utils';
import { PaymentusProfile } from '@/types/paymentus';

interface PaymentProfilesListProps {
  profiles: PaymentusProfile[];
  verifyIdentityRequired?: boolean;
}

export const PaymentProfilesList: FC<PaymentProfilesListProps> = ({
  profiles,
  verifyIdentityRequired = false,
}) => {
  const renderBankData = (paymentItem: PaymentusProfile) => {
    // If the paymentItem is a credit card then show 'VISA' or 'MASTERCARD', etc.
    // Otherwise (if it's an bank account), show the name of bank.
    const branchName = getBranchName({
      type: paymentItem.type,
      bankName: paymentItem['bank-name'],
    });

    return (
      <div key={`${paymentItem.token}`}>
        <BankData
          numberOfAccounts={profiles.length}
          accountNumber={paymentItem['account-number']}
          accountType={getAccountTypeDisplay(paymentItem.type)}
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
