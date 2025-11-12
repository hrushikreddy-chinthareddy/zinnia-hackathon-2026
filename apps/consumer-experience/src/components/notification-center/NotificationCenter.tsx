'use client';
import { useIsClient } from '@xd/hooks/useIsClient';
import { Icon, IconType, Pagination } from '@zinnia/bloom/components';
import clsx from 'clsx';

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
      <div className={Styles.markAllReadContainer}>
        <Icon
          small
          type={IconType.CIRCLE_CHECKMARK}
          color="rgba(0, 98, 139, 1)"
        />
        <span className={clsx(Styles.link, 'typography-nav-links-sm')}>
          Mark all as read
        </span>
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
      )}
      <Pagination total={20} limit={5} offset={0} goToPage={() => {}} />
      {/* <section
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
      </section> */}
    </div>
  );
};
