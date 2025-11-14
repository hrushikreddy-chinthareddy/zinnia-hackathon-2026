'use client';

import { useQuery } from '@tanstack/react-query';
import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useParams, usePathname } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';

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
  const [visible, setVisible] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Persist dismiss state per policy by using a scoped storage key
  const storageKey =
    planCode && policyNumber
      ? `notificationAlertDismissed:${planCode}:${policyNumber}`
      : undefined;

  const [localNotificationIds, setLocalNotificationIds] = useState(
    () => new Set<string>()
  );
  const [hasDismissed, setHasDismissed] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Fetch new cases
  const { data: notifications = [], refetch } = useQuery({
    ...caseQueryOptions({
      policyNumber,
      caseStatus: [CaseStatus.IN_PROGRESS],
    }),
    // Store only the notification IDs; these are used for comparison and persistence
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
      setHasDismissed(true);
    }

    setHasHydrated(true);
  }, [storageKey]);

  // refetch on route change
  useEffect(() => {
    refetch();
  }, [pathName, refetch]);

  // Check if there are brand new notifications by testing them against the currently stored IDs in the set
  const areNotificationsNew = useCallback(() => {
    // If any current notification ID is not in the locally stored set,
    // we consider the notifications "new" relative to the last dismiss
    return notifications.some(
      notification => !localNotificationIds.has(notification)
    );
  }, [notifications, localNotificationIds]);

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

  // Show the notification alert if there are new notifications
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (notifications.length === 0) {
      setVisible(false);
      return;
    }

    // If the user has never dismissed, show whenever there are notifications
    if (!hasDismissed) {
      setVisible(true);
      return;
    }

    // If the user has dismissed before, only show when there are new IDs
    if (areNotificationsNew()) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [hasHydrated, hasDismissed, notifications, areNotificationsNew]);

  // Dismiss the notification alert
  const handleDismiss = () => {
    // Capture the current set of notification IDs so we can compare
    // future notifications against this snapshot
    setLocalNotificationIds(new Set(notifications));
    setVisible(false);
    setHasDismissed(true);

    // Persist the dismissed notification IDs for this policy in session storage
    if (storageKey) {
      setNotificationAlertDismissedIds(storageKey, notifications);
    }
  };

  if (!planCode || !policyNumber) {
    return null;
  }

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
