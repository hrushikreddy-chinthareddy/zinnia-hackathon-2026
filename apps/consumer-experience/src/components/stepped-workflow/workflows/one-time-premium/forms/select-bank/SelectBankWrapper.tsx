'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { Loader } from '@zinnia/bloom/components';

import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { getPaymentMethods } from '@/queries/payment-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PaymentProvider } from '@/types/carrier-config';

import { SelectBank } from './SelectBank';

interface SelectBankWrapperProps {
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
  paymentProvider?: PaymentProvider;
}

export const SelectBankWrapper = ({
  policyNumber,
  planCode,
  lineOfBusiness,
  paymentProvider,
}: SelectBankWrapperProps) => {
  const { setPrimaryButtonDisabled } = useSteppedWorkflowContext();
  const {
    data: paymentMethods,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: [
      QueryKeys.PAYMENT_METHODS,
      policyNumber,
      planCode,
      paymentProvider,
    ],
    queryFn: () => getPaymentMethods(policyNumber, planCode),
  });

  // disable submit button if there are no payment methods or if the query is not successful
  const disableSubmitBtn = isError || paymentMethods?.length === 0;

  if (disableSubmitBtn) {
    setPrimaryButtonDisabled(true);
  }

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
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </div>
      )}
      {isError && (
        <div>
          We’re having trouble getting your payment methods. Please try again
          later.
        </div>
      )}
      {isSuccess && (
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
