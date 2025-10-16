'use client';
import { useIsClient } from '@xd/hooks/useIsClient';
import {
  AssistiveTextVariant,
  Icon,
  IconType,
  Loader,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

import { NotificationCenterSection } from '@/components/notification-center/section/NotificationCenterSection';
import { useAcknowledgeCases } from '@/hooks/use-acknowledge-cases';

import { default as Styles } from './NotificationCenter.module.css';
import { NotificationCenterProps } from './types';
import { sortNotificationsByDate } from './utils';

export const NotificationCenter = ({
  initialNotifications,
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
    initialNotifications,
  });

  const handleAcknowledge = (id: string, stepsToAcknowledge: string[]) =>
    acknowledgedCaseMutation.mutate({ id, stepsToAcknowledge });

  const showLoader =
    acknowledgedNotificationsLoading ||
    acknowledgedCaseMutation.isPending ||
    !isClient ||
    isLoading ||
    isFetching;

  return (
    <div className={Styles.container}>
      {actionNeededNotifications.length > 0 && (
        <NotificationCenterSection
          className={Styles.actionNeeded}
          variant={AssistiveTextVariant.Error}
          sectionHeading="Action Needed"
          notifications={actionNeededNotifications.sort(
            sortNotificationsByDate
          )}
          handleAcknowledge={handleAcknowledge}
          acknowledgedNotifications={acknowledgedNotifications}
          isLoading={isLoading}
          isClient={isClient}
          mutatingId={acknowledgedCaseMutation?.variables?.id}
        />
      )}
      {completedNotifications.length > 0 && (
        <NotificationCenterSection
          className={Styles.completed}
          variant={AssistiveTextVariant.Success}
          sectionHeading="Completed"
          notifications={completedNotifications.sort(sortNotificationsByDate)}
          handleAcknowledge={handleAcknowledge}
          acknowledgedNotifications={acknowledgedNotifications}
          isLoading={isLoading}
          isClient={isClient}
        />
      )}
      <section
        style={{
          backgroundColor: clsx(
            (isError || isLoading) &&
              'var(--color-base-surface-surface-secondary)'
          ),
        }}
        className={Styles.end}
      >
        {showLoader ? (
          <Loader />
        ) : (
          <>
            <Icon
              width={32}
              height={32}
              color={clsx(
                isError && 'var(--color-status-icon-status-error-icon)'
              )}
              type={isError ? IconType.HEX_EXCLAMATION : IconType.FLAG_GOALS}
            />
            <h2
              style={{
                color: clsx(
                  isError && 'var(--color-status-text-status-error-text)'
                ),
              }}
              className="typography-labels-label-lg"
            >
              {isError
                ? 'There was a problem fetching notifications'
                : "That's All Your Notifications From the Last 30 Days"}
            </h2>
          </>
        )}
      </section>
    </div>
  );
};
