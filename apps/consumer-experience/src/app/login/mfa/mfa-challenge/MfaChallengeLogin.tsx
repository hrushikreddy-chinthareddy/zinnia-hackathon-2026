'use client';

import { useRouter } from 'next/navigation';

import { MfaChallenge } from '@/components/mfa/mfa-challenge/MfaChallenge';
import { ROOT_URL_PATH } from '@/types';
import { FROM_LOGIN_QUERY_KEY } from '@/utils/serverClientUtils';

/**
 * This exists as a wrapper for MFA challenge to be used in server side
 * components/pages when the action on success or failure needs to redirect
 * the user
 */
export const MfaChallengeLogin = ({
  enrollment,
  id,
}: {
  enrollment?: string;
  id?: string;
}) => {
  const router = useRouter();
  return (
    <MfaChallenge
      enrollment={enrollment}
      id={id}
      onChallengeSuccess={() =>
        router.push(`/${ROOT_URL_PATH}?${FROM_LOGIN_QUERY_KEY}=true`)
      }
      onChallengeFailure={() => router.push(`/login/error`)}
    />
  );
};
