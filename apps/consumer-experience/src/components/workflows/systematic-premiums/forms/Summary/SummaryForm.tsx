'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TransactionFailureResponse } from '@xd/api-types/dist/generated-types/bpm';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';

import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import {
  TRANSACTION_ERROR_QUERY_PARAM,
  TransactionErrorType,
} from '@/components/stepped-workflow/types';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { QueryKeys } from '@/queries/query-keys';
import {
  getSystematicPremiumValidation,
  submitSystematicPremium,
} from '@/queries/transaction-queries';

import { SummaryTable } from './SummaryTable';

export const SummaryForm = () => {
  const router = useRouter();
  const { state } = useSystematicPremiums();
  const { stepInfo } = useSteppedWorkflowContext();
  const { planCode, policyNumber } = usePolicyUrlInputs();
  const form = useForm();

  const {
    data: validationResponse,
    isError: validationError,
    isLoading,
  } = useQuery({
    queryKey: [QueryKeys.SYSTEMATIC_PREMIUMS_VALIDATION, state],
    queryFn: () => {
      return getSystematicPremiumValidation({
        planCode,
        policyNumber,
        body: state,
      });
    },
  });

  const mutation = useMutation({
    mutationFn: () => {
      return submitSystematicPremium({
        planCode,
        policyNumber,
        body: state,
      });
    },
    onSuccess: data => {
      if (data && 'caseId' in data) {
        router.push(stepInfo.nextStepUrl);
      } else {
        router.push(
          `error?${TRANSACTION_ERROR_QUERY_PARAM}=${TransactionErrorType.SUBMISSION_FAILED}`
        );
      }
    },
    onError: () => {
      router.push('error');
    },
  });

  // We include the validationError and mutation states here because the navigation is loading
  // but the execution continues. So the form renders for a flash before the
  // redirect has taken effect.
  if (
    isLoading ||
    validationError ||
    mutation.isError ||
    mutation.isPending ||
    mutation.isSuccess
  ) {
    if (validationError) {
      router.push('error');
    }

    return <PaymentLoading />;
  }

  const onSubmit = () => {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate();
  };

  return (
    <>
      <form
        id="submit-form"
        style={
          {
            '--field-container-gap': 'var(--measure-dimension-gap-sm)',
          } as CSSProperties
        }
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <SummaryTable policyNumber={policyNumber} planCode={planCode} />
      </form>
      {validationResponse?.status ===
        TransactionFailureResponse.status.FAILURE && (
        <div>
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
    </>
  );
};
