'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { submitPartialWithdrawalOneTime } from '@/queries/transaction-queries';

import { WithdrawalSteps } from '../steps';
import { getNextUrl } from '../utils';

// TODO: XG - How can we move this compopnent to the stepped-workflow
export const MFAStep = () => {
  const router = useRouter();
  const needsVerification = useNeedsVerificationCode();
  const { state } = useWithdrawals();
  const { policyNumber, planCode, lineOfBusinessUrl } = usePolicyUrlInputs();

  const cancelUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/`;

  const nextUrl = getNextUrl({
    step: WithdrawalSteps.MFA,
    planCode,
    policyNumber,
  });

  const mutation = useMutation({
    mutationFn: () => {
      return submitPartialWithdrawalOneTime({
        planCode,
        policyNumber,
        body: state,
      });
    },
    onSuccess: ({ data }) => {
      if (data?.caseId?.length) {
        router.push(nextUrl);
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

  if (mutation.isPending) {
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
