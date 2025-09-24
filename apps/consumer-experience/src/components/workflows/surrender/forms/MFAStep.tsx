'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useSurrender } from '@/components/providers/surrender/useSurrender';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { submitFullSurrender } from '@/queries/fullsurrender-queries';

export const MFAStep = () => {
  const router = useRouter();
  const needsVerification = useNeedsVerificationCode();
  const { stepInfo, cancelUrl, setPrimaryButtonDisabled } =
    useSteppedWorkflowContext();
  const { state } = useSurrender();
  const { policyNumber, planCode } = usePolicyUrlInputs();

  const mutation = useMutation({
    mutationFn: () => {
      return submitFullSurrender({
        planCode,
        policyNumber,
        body: state,
      });
    },
    onMutate: () => {
      setPrimaryButtonDisabled(true);
    },
    onSuccess: ({ data }) => {
      if (data?.caseId?.length) {
        router.push(stepInfo.nextStepUrl);
      } else {
        router.push('error');
      }
    },
    onError: () => {
      router.push('error');
    },
  });

  const submitSurrender = () => {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate();
  };

  if (!needsVerification) {
    submitSurrender();
  }

  // Show pending state while:
  // - The mutation is pending
  // - The mutation is successful, as we want to wait for the redirect in the onSuccess callback to finish unmounting the component
  if (mutation.isPending || mutation.isSuccess) {
    return <PaymentLoading />;
  }

  return (
    <VerifyIdentity
      onSuccess={submitSurrender}
      onFailure={() => {
        router.push('error');
      }}
      closeCallback={() => {
        router.push(cancelUrl);
      }}
      transactionDescription="surrender"
    />
  );
};
