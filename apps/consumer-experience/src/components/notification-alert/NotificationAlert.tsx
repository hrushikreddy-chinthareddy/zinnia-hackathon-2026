'use client';

import { useQuery } from '@tanstack/react-query';
import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useParams, usePathname } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import { caseQueryOptions } from '@/queries/query-options';
import { CaseStatus } from '@/types/case';
import {
  getNotificationAlertDismissedIds,
  setNotificationAlertDismissedIds,
} from '@/utils/notificationAlertStorage';

import styles from './NotificationAlert.module.css';

const HEADER_HEIGHT = 64;

export const NotificationAlert: FC = () => {
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const pathName = usePathname();
  const [isSticky, setIsSticky] = useState(false);
  const [localNotificationIds, setLocalNotificationIds] = useState(
    () => new Set<string>() //Why local state? Performance reasons mainly. Its way faster to do this than try to read it from storage each time
  );
  const [hasHydrated, setHasHydrated] = useState(false);

  // Persist caseIds per policy by using a scoped storage key
  const storageKey =
    planCode && policyNumber
      ? `notificationAlertDismissed:${planCode}:${policyNumber}`
      : undefined;

  // Fetch new cases and extract the IDs
  const { data: notifications = [], refetch } = useQuery({
    ...caseQueryOptions({
      policyNumber,
      caseStatus: [CaseStatus.IN_PROGRESS],
    }),
    select: data => data.data.map(item => item.id as string),
    enabled: !!planCode && !!policyNumber,
  });

  // On mount (and when the policy changes), hydrate dismissed IDs from storage.
  // If we have dismissed IDs, treat the alert as already dismissed for this policy
  // until a new notification ID appears.
  useEffect(() => {
    if (!storageKey) {
      setHasHydrated(true);
      return;
    }

    const dismissedIds = getNotificationAlertDismissedIds(storageKey);
    if (dismissedIds.length > 0) {
      setLocalNotificationIds(new Set(dismissedIds));
    }

    setHasHydrated(true);
  }, [storageKey]);

  // refetch on route change to keep data fresh
  useEffect(() => {
    refetch();
  }, [pathName, refetch]);

  // Make the notification sticky if it scrolls down past the header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > HEADER_HEIGHT) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Dismiss the notification alert
  const handleDismiss = () => {
    // Capture the current set of notification IDs so we can compare
    // future notifications against this snapshot
    setLocalNotificationIds(new Set(notifications));

    // Persist the dismissed notification IDs for this policy in session storage
    if (storageKey) {
      setNotificationAlertDismissedIds(storageKey, notifications);
    }
  };

  if (!planCode || !policyNumber) {
    return null;
  }

  // Show the notification alert if there are new notifications
  // We need to wait for hydration to ensure we have the correct dismissed IDs
  // and we don't show the alert when we should be hidden
  const visible =
    hasHydrated &&
    notifications.length > 0 &&
    notifications.some(notification => !localNotificationIds.has(notification));

  return (
    <div
      data-testid="notification-alert"
      aria-hidden={!visible}
      className={clsx(styles.notificationAlert, {
        [styles.visible as string]: visible,
        [styles.sticky as string]: isSticky,
      })}
    >
      <BannerAlert
        icon={IconType.IN_PROGRESS}
        bodyText={`We're still processing ${notifications.length} recent request(s).`}
        canDismiss={true}
        onDismiss={handleDismiss}
        variant={BannerVariant.Information}
      />
    </div>
  );
};
