'use client';
import { useRouter } from 'next/navigation';

import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';

export const MFAStep = () => {
  const router = useRouter();
  const { stepInfo, cancelUrl } = useSteppedWorkflowContext();

  return (
    <VerifyIdentity
      onSuccess={() => router.push(stepInfo.nextStepUrl)}
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
