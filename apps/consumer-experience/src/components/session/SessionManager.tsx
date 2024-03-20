'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';

import { ClientApi } from '@/services/client-http';
import {
  SESSION_TIMEOUT,
  CHECK_SESSION_THRESHOLD,
  GetSessionResponse,
  PostSessionResponse,
} from '@/utils/serverClientUtils';
const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const onIdle = () => {
    router.push(`/session`);
  };

  const onAction = async () => {
    const elapsedTimeInMilliseconds = getElapsedTime();
    if (elapsedTimeInMilliseconds >= CHECK_SESSION_THRESHOLD) {
      const checkSessionResponse = await ClientApi.get('/api/session');
      const { isActiveSession } =
        (await checkSessionResponse.json()) as GetSessionResponse;
      if (isActiveSession) {
        const updateSessionResponse = await ClientApi.post('/api/session');

        const { success } =
          (await updateSessionResponse.json()) as PostSessionResponse;

        if (success) {
          reset();
        }
      }
    }
  };

  const { getElapsedTime, reset } = useIdleTimer({
    timeout: SESSION_TIMEOUT,
    onIdle,
    onAction,
  });

  useEffect(() => {
    reset();
  }, [pathname, reset]);

  return <>{children}</>;
};

export { SessionManager };
