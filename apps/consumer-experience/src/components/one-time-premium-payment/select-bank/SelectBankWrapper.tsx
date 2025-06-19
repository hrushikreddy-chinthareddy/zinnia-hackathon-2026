'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { Loader } from '@zinnia/bloom/components';

import {
  getAccountTypeDisplay,
  getBranchName,
} from '@/components/paymentus/utils';
import { getPaymentMethods } from '@/queries/payment-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PaymentMethod, PaymentProvider } from '@/types/payment';

import { SelectBank } from './SelectBank';

interface SelectBankWrapperProps {
  planCode: string;
  policyNumber: string;
  initialPaymentMethods: PaymentMethod[];
  lineOfBusiness: LineOfBusiness;
  paymentProvider: PaymentProvider;
}

export const SelectBankWrapper = ({
  policyNumber,
  planCode,
  initialPaymentMethods,
  lineOfBusiness,
  paymentProvider,
}: SelectBankWrapperProps) => {
  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: [
      QueryKeys.PAYMENT_METHODS,
      policyNumber,
      planCode,
      paymentProvider,
    ],
    queryFn: () => getPaymentMethods(policyNumber, planCode, paymentProvider),
    initialData: initialPaymentMethods,
    select: data => {
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

  const queryClient = useQueryClient();

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
          policyNumber={policyNumber}
          planCode={planCode}
          activeBanks={paymentMethods}
          lineOfBusiness={lineOfBusiness}
          editBankEnabled={showEditBank}
          addBankEnabled={showAddBank}
          onAddPaymentMethod={handleAddPaymentMethod}
        />
      )}
    </>
  );
};
