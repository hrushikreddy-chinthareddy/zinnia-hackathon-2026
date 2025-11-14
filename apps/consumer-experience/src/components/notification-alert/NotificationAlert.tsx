'use client';

import { useQuery } from '@tanstack/react-query';
import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useParams, usePathname } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';

import { caseQueryOptions } from '@/queries/query-options';
import { CaseStatus } from '@/types/case';

import styles from './NotificationAlert.module.css';

const HEADER_HEIGHT = 64;

export const NotificationAlert: FC = () => {
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const pathName = usePathname();
  const [visible, setVisible] = useState(false);
  const [hasDismissed, setHasDimissed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [localNotificationIds, setLocalNotificationIds] = useState(
    new Set<string | undefined>()
  );

  // Fetch new cases
  const { data: notifications = [], refetch } = useQuery({
    ...caseQueryOptions({
      policyNumber,
      caseStatus: [CaseStatus.IN_PROGRESS],
    }),
    select: data => data.data.map(item => item.id),
    enabled: !!planCode && !!policyNumber,
  });

  // refetch on route change
  useEffect(() => {
    refetch();
  }, [pathName]);

  // Check if there are brand new notifications by testing them against the currently stored IDs in the set
  const areNotificationsNew = useCallback(() => {
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
    if (!hasDismissed && notifications.length > 0) {
      setVisible(true);
    }

    if (hasDismissed && areNotificationsNew()) {
      setVisible(true);
    }

    if (notifications.length === 0) {
      setVisible(false);
    }
  }, [hasDismissed, notifications.length, areNotificationsNew()]);

  // Dismiss the notification alert
  const handleDismiss = () => {
    setLocalNotificationIds(new Set(notifications));
    setVisible(false);
    setHasDimissed(true);
  };

  return (
    <BannerAlert
      className={clsx(styles.notificationAlert, {
        [styles.visible as string]: visible,
        [styles.sticky as string]: isSticky,
      })}
      icon={IconType.IN_PROGRESS}
      bodyText={`We're still processing ${notifications.length} recent request(s).`}
      canDismiss={true}
      onDismiss={handleDismiss}
      variant={BannerVariant.Information}
    />
  );
};
