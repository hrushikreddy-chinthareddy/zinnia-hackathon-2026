'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { Loader } from '@zinnia/bloom/components';

import { CorrelationId } from '@/components/correlation-id/CorrelationId';
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
}

export const SelectBankWrapper = ({
  policyNumber,
  planCode,
  initialPaymentMethods,
  paymentProvider,
}: SelectBankWrapperProps) => {
  // TODO: wrap this in a hook so we don't have to replicate this everywhere
  const {
    data: paymentMethods = [],
    isLoading,
    isError,
    isSuccess,
    error,
  } = useQuery({
    queryKey: [QueryKeys.PAYMENT_METHODS, policyNumber, planCode],
    queryFn: () => getPaymentMethods(policyNumber, planCode),
    initialData: initialPaymentMethods,
  });

  const queryClient = useQueryClient();

  // @TODO CUI-869: Add edit bank functionality
  // const showEditBank = false;
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
      {isError && (
        <div>
          We're having trouble getting your payment methods. Please try again
          later. <CorrelationId id={error?.correlationId} />
        </div>
      )}
      {isSuccess && (
        <SelectBank
          activeBanks={paymentMethods ?? []}
          addBankEnabled={showAddBank}
          onAddPaymentMethod={handleAddPaymentMethod}
        />
      )}
    </>
  );
};
