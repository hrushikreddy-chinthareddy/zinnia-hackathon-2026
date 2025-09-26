'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { submitPartialWithdrawalOneTime } from '@/queries/transaction-queries';

// TODO: XG - How can we move this compopnent to the stepped-workflow
export const MFAStep = () => {
  const router = useRouter();
  const needsVerification = useNeedsVerificationCode();
  const { stepInfo, cancelUrl, setPrimaryButtonDisabled } =
    useSteppedWorkflowContext();
  const { state } = useWithdrawals();
  const { policyNumber, planCode } = usePolicyUrlInputs();

  const mutation = useMutation({
    mutationFn: () => {
      return submitPartialWithdrawalOneTime({
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

  const submitWithdrawal = () => {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate();
  };

  if (!needsVerification) {
    submitWithdrawal();
  }

  // Show pending state while:
  // - The mutation is pending
  // - The mutation is successful, as we want to wait for the redirect in the onSuccess callback to finish unmounting the component
  if (mutation.isPending || mutation.isSuccess) {
    return <PaymentLoading />;
  }

  return (
    <VerifyIdentity
      onSuccess={submitWithdrawal}
      onFailure={() => {
        router.push('error');
      }}
      closeCallback={() => {
        router.push(cancelUrl);
      }}
      transactionDescription="withdrawal"
    />
  );
};
