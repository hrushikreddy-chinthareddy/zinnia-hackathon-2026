'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';
import { useGetTransactionStepData } from '@/hooks/use-get-transaction-step-data';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { submitFreeLookCancellation } from '@/queries/free-look-cancel-queries';
import { generateTransactionErrorUrl } from '@/services/errors/errors';

import { useFreeLookCancel } from '../provider/useFreeLookCancel';
import { stepsInfo } from '../steps';

export const MFAStep = () => {
  const router = useRouter();
  const { state } = useFreeLookCancel();
  const { lineOfBusinessUrl, planCode, policyNumber } = usePolicyUrlInputs();
  const { nextStep } = useGetTransactionStepData({ stepsInfo });
  const needsVerification = useNeedsVerificationCode();

  const mutation = useMutation({
    mutationFn: async () => {
      return await submitFreeLookCancellation({
        planCode,
        policyNumber,
        body: state,
      });
    },
    onSuccess: () => {
      router.push(nextStep?.url || '');
    },
    onError: err => {
      const errorUrl = generateTransactionErrorUrl(err);

      router.push(errorUrl);
    },
  });

  const handleSubmit = () => {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate();
  };

  if (!needsVerification) {
    handleSubmit();
  }

  // Show pending state while:
  // - The mutation is pending
  // - The mutation is successful/errors, to wait for the redirect in the callback
  if (mutation.isPending || mutation.isSuccess || mutation.isError) {
    return <PaymentLoading />;
  }

  return (
    <VerifyIdentity
      onSuccess={handleSubmit}
      onFailure={() => {
        router.push('error');
      }}
      closeCallback={() => {
        router.push(
          `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/account/free-look-cancel`
        );
      }}
      transactionDescription="surrender"
    />
  );
};
