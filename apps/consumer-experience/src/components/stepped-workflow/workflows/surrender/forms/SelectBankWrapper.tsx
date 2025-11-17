'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Address, LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Loader } from '@zinnia/bloom/components';

import {
  getAccountTypeDisplay,
  getBranchName,
} from '@/components/paymentus/utils';
import { getPaymentMethods } from '@/queries/payment-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PaymentProvider } from '@/types/carrier-config';
import { PaymentMethod } from '@/types/payment';

import { SelectBank } from './SelectBank';

interface SelectBankWrapperProps {
  planCode: string;
  policyNumber: string;
  initialPaymentMethods: PaymentMethod[];
  lineOfBusiness: LineOfBusiness;
  paymentProvider?: PaymentProvider;
  activeAddresses?: Address[];
}

export const SelectBankWrapper = ({
  policyNumber,
  planCode,
  initialPaymentMethods,
  activeAddresses = [],
  paymentProvider,
}: SelectBankWrapperProps) => {
  const queryClient = useQueryClient();
  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: [
      QueryKeys.PAYMENT_METHODS,
      policyNumber,
      planCode,
      paymentProvider,
    ],
    queryFn: () => getPaymentMethods(policyNumber, planCode),
    initialData: initialPaymentMethods,
    select: (data: PaymentMethod[]) => {
      return paymentProvider === PaymentProvider.PAYMENTUS
        ? data?.map(paymentMethod => ({
            ...paymentMethod,
            accountType: getAccountTypeDisplay(paymentMethod.type!),
            branchName: getBranchName({
              type: paymentMethod.type!,
              bankName: paymentMethod.branchName,
            }),
          }))
        : data;
    },
  });

  // @TODO CUI-869: Add edit bank functionality
  const showEditBank = false;
  const showAddBank = paymentProvider === PaymentProvider.PAYMENTUS;

  const handleAddPaymentMethod = () => {
    queryClient.invalidateQueries({
      queryKey: [
        QueryKeys.PAYMENT_METHODS,
        policyNumber,
        planCode,
        paymentProvider,
      ],
    });
  };

  return (
    <>
      {isLoading && <Loader />}
      {paymentMethods && paymentMethods.length > 0 && (
        <SelectBank
          activeBanks={paymentMethods ?? []}
          activeAddresses={activeAddresses}
          editBankEnabled={showEditBank}
          addBankEnabled={showAddBank}
          onAddPaymentMethod={handleAddPaymentMethod}
        />
      )}
    </>
  );
};
