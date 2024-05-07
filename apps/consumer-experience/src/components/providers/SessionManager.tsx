'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';

import { ClientApi } from '@/services/client-http';
import {
  SESSION_TIMEOUT_IN_MILLISECONDS,
  CHECK_SESSION_THRESHOLD,
  GetSessionResponse,
  PostSessionResponse,
} from '@/utils/serverClientUtils';
const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const onIdle = () => {
    window.location.reload();
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
      } else {
        window.location.reload();
      }
    }
  };

  const { getElapsedTime, reset } = useIdleTimer({
    timeout: SESSION_TIMEOUT_IN_MILLISECONDS,
    onIdle,
    onAction,
  });

  useEffect(() => {
    reset();
  }, [pathname, reset]);

  return <>{children}</>;
};

export { SessionManager };
