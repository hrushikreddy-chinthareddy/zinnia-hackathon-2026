'use client';
import { useIsClient } from '@xd/hooks/useIsClient';
import { Icon, IconType } from '@zinnia/bloom/components';

import { NotificationCenterSection } from '@/components/notification-center/section/NotificationCenterSection';
import { useAcknowledgeCases } from '@/hooks/use-acknowledge-cases';

import { default as Styles } from './NotificationCenter.module.css';
import { NotificationCenterProps } from './types';
import { sortNotificationsByDate } from './utils';

export const NotificationCenter = ({
  policyNumber,
  planCode,
}: NotificationCenterProps) => {
  const isClient = useIsClient();

  const {
    acknowledgedNotifications,
    acknowledgedNotificationsLoading,
    acknowledgedCaseMutation,
    actionNeededNotifications,
    completedNotifications,
    notificationsLoading: isLoading,
    notificationsError: isError,
    notificationsFetching: isFetching,
  } = useAcknowledgeCases({
    planCode,
    policyNumber,
  });

  const handleAcknowledge = (id: string, stepsToAcknowledge: string[]) =>
    acknowledgedCaseMutation.mutate({ id, stepsToAcknowledge });

  const showLoader =
    acknowledgedNotificationsLoading ||
    acknowledgedCaseMutation.isPending ||
    !isClient ||
    isLoading ||
    isFetching;

  const allNotifications = actionNeededNotifications.concat(
    completedNotifications
  );

  return (
    <div className={Styles.container}>
      {allNotifications.length > 0 ? (
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
