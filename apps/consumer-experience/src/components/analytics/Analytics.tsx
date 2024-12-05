'use client';

import { useEffect } from 'react';

import { useUser } from '@/hooks/use-user';
import { analytics } from '@/utils/segment';

// TODO: i should probably name this something else
export default function Analytics() {
  const { user } = useUser();

  useEffect(() => {
    // TODO: how to test this?
    analytics.segmentIdentify(user?.partyId);
    // analytics.page('');
  }, [user]);

  return null;
}
