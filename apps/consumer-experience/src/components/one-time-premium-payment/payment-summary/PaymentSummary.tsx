'use client';
import { useMutation } from '@tanstack/react-query';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { useComponentVisibility } from '@/hooks/use-component-visibility';
import { submitOttp } from '@/queries/premium-queries';
import { ComponentName } from '@/services/display-rules/types';

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
  const { paymentFee, paymentAmount } = state;
  const form = useForm();
  const { stepInfo: currentStepInfo } = useSteppedWorkflowContext();

  const calculateFeeAmount = useMemo(() => {
    if (!paymentFee) {
      return 0;
    }
    return (paymentFee / 100) * paymentAmount.plain;
  }, [paymentAmount.plain, paymentFee]);

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

  const { data: visibility } = useComponentVisibility(planCode, policyNumber);

  const submitPayment = () => {
    mutation.mutate();
  };

  if (mutation.isPending || mutation.isError || mutation.isSuccess) {
    return <PaymentLoading />;
  }

  // Display the account value in the summary only if the policy is not a term policy
  const paymentSummaryStepDetails = [];

  if (visibility?.[ComponentName.OTTP_PAYMENT_SUMMARY_ACCOUNT_VALUE]) {
    paymentSummaryStepDetails.push({
      label: <Label>Add to account value</Label>,
      value: paymentAmount.withFees - uncollectedCharges,
    });
  }

  if (calculateFeeAmount > 0) {
    paymentSummaryStepDetails.push({
      label: (
        <Label
          interactiveElements={[
            <LabelPopover key="TEXT" title="Fees">
              <p>
                Premium payment fees are charged to cover costs related to sales
                expenses and/or taxes. If your policy requires these fees, they
                will be shown here.
              </p>
            </LabelPopover>,
          ]}
        >
          Fees
        </Label>
      ),
      value: calculateFeeAmount,
    });
  }

  if (uncollectedCharges && uncollectedCharges > 0) {
    paymentSummaryStepDetails.push({
      label: (
        <Label
          interactiveElements={[
            <LabelPopover key="TEXT" title="Estimated charges">
              <p>
                Additional charges may accrue if your policy went into pending
                lapse. These charges are estimated here because they are
                calculated daily.
              </p>
            </LabelPopover>,
          ]}
        >
          Estimated charges
        </Label>
      ),
      value: uncollectedCharges,
    });
  }

  return (
    <form id="submit-form" onSubmit={form.handleSubmit(submitPayment)}>
      <SummaryForm
        ottpPaymentData={state}
        paymentSummaryDetails={paymentSummaryStepDetails}
      />
    </form>
  );
};
