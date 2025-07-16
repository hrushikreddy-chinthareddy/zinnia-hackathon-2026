'use client';
import { useMutation } from '@tanstack/react-query';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { submitOttp } from '@/queries/premium-queries';

import { SummaryForm } from './SummaryForm';
import { useOttp } from '../../providers/one-time-premium-payment/OttpContext';

export interface OTTPPaymentDetails {
  effectiveDate: string;
  paymentAmount: number;
  payorBank: string;
}

export const PaymentSummary = ({
  planCode,
  policyNumber,
  lineOfBusiness,
  uncollectedCharges,
}: {
  moveToNextStep?: () => void;
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
  uncollectedCharges: number;
}) => {
  const router = useRouter();
  const { state } = useOttp();
  const form = useForm();
  const { stepInfo: currentStepInfo } = useSteppedWorkflowContext();

  const mutation = useMutation({
    mutationFn: async () => {
      const ottpRequest = {
        paymentAmount: state.paymentAmount.plain,
        effectiveDate: state.effectiveDate,
        partyId: state.payorBank?.appliesToPartyId,
        bankId: state.payorBank?.bankId,
      };
      return await submitOttp(policyNumber, planCode, ottpRequest);
    },
    onSuccess: () => {
      router.push(currentStepInfo?.nextStepUrl);
    },
    onError: () => {
      // if (error) {
      //   if (error === 400) {
      //     return (
      //       <PaymentInvalid goToUrl={paymentUrl({ planCode, policyNumber })} />
      //     );
      //   }
      //   return (
      //     <PaymentError goToUrl={paymentUrl({ planCode, policyNumber })} />
      //   );
      // }
      router.push('error');
    },
  });

  const submitPayment = () => {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate();
  };

  if (mutation.isPending) {
    return <PaymentLoading />;
  }

  return (
    <form id="submit-form" onSubmit={form.handleSubmit(submitPayment)}>
      <SummaryForm
        ottpPaymentData={state}
        planCode={planCode}
        policyNumber={policyNumber}
        lineOfBusiness={lineOfBusiness}
        uncollectedCharges={uncollectedCharges}
      />
    </form>
  );
};
