'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { SystematicPremiumsAction } from '@/components/providers/systematic-premiums/types';
import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { submitSystematicPremium } from '@/queries/transaction-queries';

export const MFAStep = () => {
  const router = useRouter();
  const needsVerification = useNeedsVerificationCode();
  const { policyNumber, planCode } = usePolicyUrlInputs();
  const { state, dispatch } = useSystematicPremiums();
  const { cancelUrl, stepInfo } = useSteppedWorkflowContext();

  const mutation = useMutation({
    mutationFn: () => {
      return submitSystematicPremium({
        planCode,
        policyNumber,
        body: state,
      });
    },
    onSuccess: ({ data, error }) => {
      if (data && 'caseId' in data) {
        dispatch({
          type: SystematicPremiumsAction.SET_SYSTEMATIC_PREMIUM_CASE_ID,
          payload: {
            caseId: data.caseId,
          },
        });
      }
      if (error) {
        throw new Error(JSON.stringify(error));
      }

      router.push(stepInfo.nextStepUrl);
    },
    onError: () => {
      router.push('error');
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

  if (mutation.isPending) {
    return <PaymentLoading />;
  }

  return (
    <VerifyIdentity
      onSuccess={handleSubmit}
      onFailure={() => {
        router.push('error');
      }}
      closeCallback={() => {
        router.push(cancelUrl);
      }}
      transactionDescription="systematic-premium"
    />
  );
};
