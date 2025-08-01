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
        // To integrate with third party banks, we now send paymentForm
        // as the accountType and rely on the backend service to convert
        // this to the correct form based on the payment method being used
        // this was communicated to us by Shrutika
        // https://se2llc-global.slack.com/archives/C08TKJG89TQ/p1753963380359029?thread_ts=1753836773.602869&cid=C08TKJG89TQ
        paymentForm: state.payorBank?.accountType,
      };
      return await submitOttp(policyNumber, planCode, ottpRequest);
    },
    onSuccess: () => {
      router.push(currentStepInfo?.nextStepUrl);
    },
    onError: () => {
      router.push('error');
    },
  });

  const submitPayment = () => {
    mutation.mutate();
  };

  if (mutation.isPending || mutation.isError || mutation.isSuccess) {
    return <PaymentLoading />;
  }

  return (
    <form id="submit-form" onSubmit={form.handleSubmit(submitPayment)}>
      <SummaryForm
        ottpPaymentData={state}
        uncollectedCharges={uncollectedCharges}
      />
    </form>
  );
};
