'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TransactionFailureResponse } from '@xd/api-types/dist/generated-types/bpm';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { QueryKeys } from '@/queries/query-keys';
import {
  getSystematicPremiumValidation,
  submitSystematicPremium,
} from '@/queries/transaction-queries';
import { generateTransactionErrorUrl } from '@/services/errors/errors';

import { SummaryTable } from './SummaryTable';
import { useSystematicPremiums } from '../../provider/useSystematicPremiums';

export const SummaryForm = () => {
  const router = useRouter();
  const { state } = useSystematicPremiums();
  const { stepInfo, setPrimaryButtonDisabled } = useSteppedWorkflowContext();
  const { planCode, policyNumber } = usePolicyUrlInputs();
  const form = useForm();

  const mutation = useMutation({
    mutationFn: () => {
      return submitSystematicPremium({
        planCode,
        policyNumber,
        body: state,
      });
    },
    onMutate: () => {
      setPrimaryButtonDisabled(true);
    },
    onSuccess: data => {
      if (data && 'caseId' in data) {
        router.push(stepInfo.nextStepUrl);
        setPrimaryButtonDisabled(false);
      }
    },
    onError: err => {
      const errorUrl = generateTransactionErrorUrl(err);
      router.push(errorUrl);
    },
  });

  const {
    data: validationResponse,
    isError: validationError,
    isSuccess: isValidationSuccess,
    error,
    isFetching: isValidationFetching,
  } = useQuery({
    queryKey: [
      QueryKeys.SYSTEMATIC_PREMIUMS_VALIDATION,
      planCode,
      policyNumber,
      state,
    ],
    queryFn: () =>
      getSystematicPremiumValidation({
        planCode,
        policyNumber,
        body: state,
      }),
  });

  if (validationError) {
    router.push(`error?correlationId=${error.correlationId}`);
  }

  // Show pending state while:
  // - The mutation is pending
  // - The validation is fetching
  // - The mutation is successful, as we want to wait for the redirect in the onSuccess callback to finish unmounting the component
  if (
    isValidationFetching ||
    mutation.isPending ||
    mutation.isSuccess ||
    mutation.isError
  ) {
    setPrimaryButtonDisabled(true);
    return <PaymentLoading />;
  }

  if (isValidationSuccess) {
    setPrimaryButtonDisabled(false);
  }

  if (
    validationResponse?.status === TransactionFailureResponse.status.FAILURE
  ) {
    setPrimaryButtonDisabled(true);
  }

  const onSubmit = async () => {
    if (isValidationFetching || mutation.isPending) return;

    if (
      validationResponse?.status === TransactionFailureResponse.status.SUCCESS
    ) {
      mutation.mutate();
    }
  };

  return (
    validationResponse && (
      <div>
        <form id="submit-form" onSubmit={form.handleSubmit(onSubmit)}>
          <SummaryTable policyNumber={policyNumber} planCode={planCode} />
        </form>
        {validationResponse?.status ===
          TransactionFailureResponse.status.FAILURE && (
          <div className="mt-lg">
            {validationResponse.validationResult?.map(
              (result, index) =>
                result.resolution?.length && (
                  <AssistiveText
                    className="mb-md"
                    key={index}
                    variant={AssistiveTextVariant.Error}
                    text={result.error + ' ' + result.resolution}
                  />
                )
            )}
          </div>
        )}
      </div>
    )
  );
};
