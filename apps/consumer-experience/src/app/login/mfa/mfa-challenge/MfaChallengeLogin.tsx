'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
  // attempt to prefetch to speed up the next router redirect
  // it's a known thing that navigating with next router is slooooow
  useEffect(() => {
    router.prefetch(
      `${window.location.origin}/${ROOT_URL_PATH}?${FROM_LOGIN_QUERY_KEY}=true`
    );
    router.prefetch(`${window.location.origin}/login/error`);
  }, [router]);

  return (
    <MfaChallenge
      enrollment={enrollment}
      id={id}
      onChallengeSuccess={() =>
        router.push(
          `${window.location.origin}/${ROOT_URL_PATH}?${FROM_LOGIN_QUERY_KEY}=true`
        )
      }
      onChallengeFailure={() =>
        router.push(`${window.location.origin}/login/error`)
      }
    />
  );
};
