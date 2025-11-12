'use client';

import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';

import styles from './NotificationAlert.module.css';

const HEADER_HEIGHT = 64;

export const NotificationAlert: FC = () => {
  const [visible, setVisible] = useState(false);
  const [hasDismissed, setHasDimissed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

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
    const timer = setTimeout(() => {
      if (!hasDismissed) {
        setVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasDismissed]);

  const handleDismiss = () => {
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
      bodyText="This is a notification alert"
      canDismiss={true}
      onDismiss={handleDismiss}
      variant={BannerVariant.Information}
    />
  );
};
