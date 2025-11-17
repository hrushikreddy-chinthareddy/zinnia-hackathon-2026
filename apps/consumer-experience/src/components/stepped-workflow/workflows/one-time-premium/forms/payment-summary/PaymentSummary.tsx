'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TransactionFailureResponse } from '@zinnia/api-types/types/bpm';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import {
  AssistiveText,
  AssistiveTextVariant,
  Label,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { useComponentVisibility } from '@/hooks/use-component-visibility';
import {
  getOneTimePremiumValidation,
  submitOttp,
} from '@/queries/premium-queries';
import { QueryKeys } from '@/queries/query-keys';
import { ComponentName } from '@/services/display-rules/types';
import { generateTransactionErrorUrl } from '@/services/errors/errors';

import { SummaryForm } from './SummaryForm';
import { useOttp } from '../../provider/OttpContext';

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
  const { stepInfo: currentStepInfo, setPrimaryButtonDisabled } =
    useSteppedWorkflowContext();

  const calculateFeeAmount = useMemo(() => {
    if (!paymentFee) {
      return 0;
    }
    return (paymentFee / 100) * paymentAmount.plain;
  }, [paymentAmount.plain, paymentFee]);

  // @TODO: maybe this can be moved to a helper, or a buildOneTimePremiumRequestBody function
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

  const mutation = useMutation({
    mutationFn: async () => {
      return await submitOttp(policyNumber, planCode, ottpRequest);
    },
    onSuccess: data => {
      if ('caseId' in data) {
        router.push(currentStepInfo?.nextStepUrl);
      }
    },
    onError: err => {
      const errorUrl = generateTransactionErrorUrl(err);

      router.push(errorUrl);
    },
    onMutate: () => {
      setPrimaryButtonDisabled(true);
    },
  });

  const {
    data: validationResponse,
    isError: validationError,
    error,
    isFetching: validationFetching,
  } = useQuery({
    queryKey: [QueryKeys.ONE_TIME_PREMIUM_VALIDATION, state],
    queryFn: () => {
      return getOneTimePremiumValidation(policyNumber, planCode, ottpRequest);
    },
  });

  if (validationError) {
    router.push(`error?correlationId=${error.correlationId}`);
  }

  const { data: visibility } = useComponentVisibility(planCode, policyNumber);

  if (
    validationResponse?.status === TransactionFailureResponse.status.SUCCESS
  ) {
    setPrimaryButtonDisabled(false);
  }

  if (
    validationResponse?.status === TransactionFailureResponse.status.FAILURE
  ) {
    setPrimaryButtonDisabled(true);
  }

  const submitPayment = () => {
    if (validationFetching || mutation.isPending) return;

    if (
      validationResponse?.status === TransactionFailureResponse.status.SUCCESS
    ) {
      mutation.mutate();
    }
  };

  // Show pending state:
  // - The validation/submit calls are loading
  // - on error, while we wait for the redirect to the error page
  // - on success, while we wait for the redirect to the next step
  if (
    validationFetching ||
    validationError ||
    mutation.isPending ||
    mutation.isError ||
    mutation.isSuccess
  ) {
    setPrimaryButtonDisabled(true);
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
    validationResponse && (
      <>
        <form id="submit-form" onSubmit={form.handleSubmit(submitPayment)}>
          <SummaryForm
            ottpPaymentData={state}
            paymentSummaryDetails={paymentSummaryStepDetails}
          />
        </form>
        {validationResponse.status ===
          TransactionFailureResponse.status.FAILURE && (
          <div>
            {validationResponse.validationResult?.map(
              (result, index) =>
                result.resolution?.length && (
                  <AssistiveText
                    className="mb-md"
                    key={index}
                    variant={AssistiveTextVariant.Error}
                    text={result.resolution}
                  />
                )
            )}
          </div>
        )}
      </>
    )
  );
};
