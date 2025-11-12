'use client';

import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC, useEffect, useRef, useState } from 'react';

import styles from './NotificationAlert.module.css';

export const NotificationAlert: FC = () => {
  const [visible, setVisible] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [hasDismissed, setHasDimissed] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (!hasDismissed) {
        setVisible(true);
      }
    }, 5000);
  }, [hasDismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setHasDimissed(true);
  };

  return (
    <BannerAlert
      // ref={notificationRef}
      className={clsx(styles.notificationAlert, {
        [styles.visible as string]: visible,
      })}
      icon={IconType.IN_PROGRESS}
      bodyText="This is a notification alert"
      canDismiss={true}
      onDismiss={handleDismiss}
      variant={BannerVariant.Information}
    />
  );
};
