'use client';

import { useEffect } from 'react';

import { useUser } from '@/hooks/use-user';
import { analytics } from '@/utils/segment';

// TODO: i should probably name this something else
export default function Analytics() {
  const { user } = useUser();

  useEffect(() => {
    analytics.segmentIdentify(user?.partyId);
  }, [user]);

  return null;
}
