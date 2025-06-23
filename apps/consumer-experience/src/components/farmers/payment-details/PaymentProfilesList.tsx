'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';

import { BankData } from '@/components/bank-data/BankData';
import { PaymentusAddPaymentMethod } from '@/components/paymentus/PaymentusAddPaymentMethod';
import {
  getAccountTypeDisplay,
  getBranchName,
} from '@/components/paymentus/utils';
import { SkeletonLoader } from '@/components/skeleton-loader/SkeletonLoader';
import { getPaymentMethods } from '@/queries/payment-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PaymentProvider } from '@/types/carrier-config';
import { PaymentMethod } from '@/types/payment';

interface PaymentProfilesListProps {
  verifyIdentityRequired?: boolean;
  policyNumber: string;
  planCode: string;
  profiles: PaymentMethod[];
}

export const PaymentProfilesList: FC<PaymentProfilesListProps> = ({
  policyNumber,
  planCode,
  verifyIdentityRequired = false,
  profiles,
}) => {
  const queryClient = useQueryClient();

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: [QueryKeys.PAYMENT_METHODS, policyNumber, planCode],
    queryFn: () =>
      getPaymentMethods(policyNumber, planCode, PaymentProvider.PAYMENTUS),
    initialData: profiles,
    select: data => {
      return data?.map(paymentMethod => ({
        ...paymentMethod,
        accountType: getAccountTypeDisplay(paymentMethod.type!),
        branchName: getBranchName({
          type: paymentMethod.type!,
          bankName: paymentMethod.branchName,
        }),
      }));
    },
  });

  const onAddPaymentMethod = () => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.PAYMENT_METHODS, policyNumber, planCode],
    });
  };

  const renderBankData = (paymentItem: PaymentMethod, index: number) => {
    return (
      <div key={`bank-${index}`}>
        <BankData
          numberOfAccounts={paymentMethods.length}
          accountNumber={paymentItem.accountNumber}
          accountType={getAccountTypeDisplay(paymentItem.type)}
          checkVerification={verifyIdentityRequired}
          branchName={paymentItem.branchName}
          nameOnAccount={paymentItem.nameOnAccount}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className="stacked-items mb-lg"
        style={{ gap: 'var(--measure-dimension-gap-sm)' }}
      >
        <SkeletonLoader width="300px" height="14px" />
        <SkeletonLoader width="300px" height="14px" />
        <SkeletonLoader width="300px" height="14px" />
      </div>
    );
  }

  return (
    <div>
      <div className="info-card-container mb-md">
        {paymentMethods.map((item, index) => renderBankData(item, index))}
      </div>
      <PaymentusAddPaymentMethod
        policyNumber={policyNumber}
        onAddPaymentMethod={onAddPaymentMethod}
      />
    </div>
  );
};
