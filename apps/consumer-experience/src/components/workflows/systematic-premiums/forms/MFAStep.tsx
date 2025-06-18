'use client';
import { useRouter } from 'next/navigation';

import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';

export const MFAStep = () => {
  const router = useRouter();
  const needsVerification = useNeedsVerificationCode()
  const { stepInfo, cancelUrl } = useSteppedWorkflowContext();

  // TODO: connect to systematic submit endpoint in CUI-830
  // const mutation = useMutation({
  //         mutationFn: () => {
  //           return submitSystematicPremium({
  //             planCode,
  //             policyNumber,
  //             body: state,
  //           });
  //         },
  //         onSuccess: ({data}) => {
  //           if (data?.caseId?.length) {
  //             router.push(nextUrl);
  //           } else {
  //             router.push('error')
  //           }
  //         },
  //         onError: () => {
  //           router.push('error');
  //         },
  //       });

  const submitSystematicPremium = () => {
    // mutation.mutate()
    router.push(stepInfo.nextStepUrl);
  };

  if (!needsVerification) {
  // mutation.mutate();
  submitSystematicPremium()
  }

  // if(mutation.isPending) {
  // return <PaymentLoading />
  // }

  return (
    <VerifyIdentity
      onSuccess={() => {
        // if(!mutation.isPending) {
        // mutation.mutate()
        submitSystematicPremium();
        // }
      }}
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
