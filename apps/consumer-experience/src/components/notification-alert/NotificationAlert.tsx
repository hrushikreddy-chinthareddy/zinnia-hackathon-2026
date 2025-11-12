'use client';

import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';

import styles from './NotificationAlert.module.css';
export const NotificationAlert: FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 5000);
  });

  return (
    <BannerAlert
      className={clsx(styles.notificationAlert, {
        [styles.visible as string]: visible,
      })}
      icon={IconType.IN_PROGRESS}
      bodyText="This is a notification alert"
      canDismiss={true}
      onDismiss={() => setVisible(false)}
      variant={BannerVariant.Information}
    />
  );
};
