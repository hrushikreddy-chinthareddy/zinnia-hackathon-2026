'use client';

import { useQuery } from '@tanstack/react-query';
import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useParams } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import { caseQueryOptions } from '@/queries/query-options';
import { CaseStatus } from '@/types/case';

import styles from './NotificationAlert.module.css';

const HEADER_HEIGHT = 64;

export const NotificationAlert: FC = () => {
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [visible, setVisible] = useState(false);
  const [hasDismissed, setHasDimissed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [localCount, setLocalCount] = useState(0);

  const { data: notificationCount = 0 } = useQuery({
    ...caseQueryOptions({
      policyNumber,
      caseStatus: [CaseStatus.IN_PROGRESS],
    }),
    select: data => data.count,
    enabled: !!planCode && !!policyNumber,
  });

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

  useEffect(() => {
    if (!hasDismissed && notificationCount > 0) {
      setVisible(true);
    }

    if (hasDismissed && notificationCount > localCount) {
      setVisible(true);
    }
  }, [hasDismissed, notificationCount, localCount]);

  const handleDismiss = () => {
    setLocalCount(notificationCount);
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
      bodyText={`We're still processing ${notificationCount} recent request(s).`}
      canDismiss={true}
      onDismiss={handleDismiss}
      variant={BannerVariant.Information}
    />
  );
};
