'use client';
import { useIsClient } from '@xd/hooks/useIsClient';
import { Icon, IconType } from '@zinnia/bloom/components';

import { NotificationCenterSection } from '@/components/notification-center/section/NotificationCenterSection';
import {
  useAcknowledgedCases,
  useMarkAsRead,
  useNotifications,
  useMarkAllAsRead,
} from '@/hooks/use-acknowledge-cases';

import { default as Styles } from './NotificationCenter.module.css';
import { NotificationCenterProps } from './types';
import { sortNotificationsByDate } from './utils';
import { Button } from '../button/Button';
import clsx from 'clsx';

export const NotificationCenter = ({
  policyNumber,
  planCode,
}: NotificationCenterProps) => {
  const isClient = useIsClient();

  // fetch acknowledged notifications
  const { data: acknowledgedNotifications = [] } = useAcknowledgedCases({
    planCode,
    policyNumber,
  });

  // fetch all notifications (the ones that need an action and the completed cases)
  const {
    data: notifications = {
      completedNotifications: [],
      actionNeededNotifications: [],
      allNotifications: [],
    },
    isLoading,
  } = useNotifications({
    planCode,
    policyNumber,
    initialNotifications,
  });

  // all notifications includes both completed and action needed notifications
  const { allNotifications } = notifications;

  // mutation to acknowledge all notifications
  const { mutate: markAllAsRead } = useMarkAllAsRead({
    planCode,
    policyNumber,
    notifications: allNotifications.map(notification => ({
      id: notification.id,
      stepsToAcknowledge: notification.stepsToAcknowledge ?? [],
    })),
  });

  // mutation to mark a specific notification as read
  const acknowledgedCaseMutation = useMarkAsRead({
    planCode,
    policyNumber,
  });

  const handleAcknowledge = (id: string, stepsToAcknowledge: string[]) => {
    acknowledgedCaseMutation.mutate({ id, stepsToAcknowledge });
  };

  return (
    <div className={Styles.container}>
      <div className={Styles.markAllReadContainer}>
        <Icon
          small
          type={IconType.CIRCLE_CHECKMARK}
          color="rgba(0, 98, 139, 1)"
        />

        <Button
          className={clsx(Styles.link, 'typography-nav-links-sm')}
          onClick={() => {
            markAllAsRead();
          }}
        >
          Mark all as read
        </Button>
      </div>
      {allNotifications.length > 0 && (
        <NotificationCenterSection
          className={Styles.actionNeeded}
          notifications={allNotifications.sort(sortNotificationsByDate)}
          handleAcknowledge={handleAcknowledge}
          acknowledgedNotifications={acknowledgedNotifications}
          isLoading={isLoading}
          isClient={isClient}
          mutatingId={acknowledgedCaseMutation?.variables?.id}
        />
      ) : (
        <div className={Styles.emptyState}>
          <div className={Styles.alertIcon}>
            <Icon type={IconType.ALERT} />
          </div>
          <h3 className="typography-labels-label-lg">
            You have no new notifications
          </h3>
        </div>
      )}
    </div>
  );
};
