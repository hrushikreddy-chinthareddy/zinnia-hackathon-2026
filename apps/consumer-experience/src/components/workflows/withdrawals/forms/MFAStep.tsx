'use client';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { VerifyIdentity } from '@/components/transaction-steps/verify-identity/VerifyIdentity';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';
import { lineOfBusinessFromPathname, lineOfBusinessUrlPath } from '@/utils/data';

import { WithdrawalSteps } from '../types';
import { getNextUrl } from '../utils';

// TODO: XG - How can we move this compopnent to the stepped-workflow
export const MFAStep = () => {
  const router = useRouter();
  const needsVerification = useNeedsVerificationCode();
  const pathname = usePathname();
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>()
  const lineOfBusiness = lineOfBusinessFromPathname(pathname);
  const cancelUrl = `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${params.planCode}/${params.policyNumber}/`;
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const nextUrl = getNextUrl({
    step: WithdrawalSteps.MFA,
    planCode,
    policyNumber,
  });

  if (!needsVerification) {
    router.push(nextUrl);
  }

  return (
    <VerifyIdentity
      onSuccess={() => {
        router.push(nextUrl);
      }}
      onFailure={() => {
        router.push('information')
      }}
      closeCallback={() => {
        router.push(cancelUrl);
      }}
      transactionDescription="withdrawal"
    />
  );
};
