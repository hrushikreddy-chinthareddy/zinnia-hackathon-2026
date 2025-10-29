'use client';
import { useRouter } from 'next/navigation';

import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';

export const MFAStep = () => {
  const router = useRouter();
  // const needsVerification = useNeedsVerificationCode();

  // TODO: Add mutation

  return (
    <VerifyIdentity
      onSuccess={() => {}}
      onFailure={() => {
        router.push('error');
      }}
      closeCallback={() => {}}
      transactionDescription="surrender"
    />
  );
};
