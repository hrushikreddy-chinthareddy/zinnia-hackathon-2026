'use client';
import { useQuery } from '@tanstack/react-query';
import { CaseInstanceSummary } from '@zinnia/api-types/types/case';
import {
  AssistiveText,
  AssistiveTextVariant,
  Icon,
  IconType,
  Loader,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { Suspense, useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';

import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { searchCasesByPolicyNumber } from '@/queries/case-queries';
import { QueryKeys } from '@/queries/query-keys';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { default as Styles } from './NotificationCenter.module.css';
import {
  acknowledgeNotifications,
  parseNotifications,
  sortNotificationsByDate,
  transformNotifications,
} from './utils';
import { SkeletonLoader } from '../skeleton-loader/SkeletonLoader';
import { NotificationCenterSidesheet } from './side-sheet/NotificatonCenterSidesheet';

const today = dayjs();

export type NotificationCenterNotification = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
};

export type NotificationCenterProps = {
  initialNotifications?: Array<CaseInstanceSummary> | null;
  policyNumber: string;
  planCode?: string;
};

export const NotificationCenter = ({
  initialNotifications,
  policyNumber,
  planCode,
}: NotificationCenterProps) => {
  const [isClient, setIsClient] = useState(false);
  const { data: featureFlags } = useFeatureFlags();
  const fetchNotificationsFlag =
    featureFlags?.[FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [acknowledgedNotifications, setAcknowledgedNotifications] =
    useLocalStorage<string[]>(QueryKeys.NOTIFICATIONS, []);

  const shouldFetchClientSideNotifications =
    !!fetchNotificationsFlag && isClient;

  const {
    data: notifications = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: [
      QueryKeys.NOTIFICATIONS,
      policyNumber,
      planCode,
      initialNotifications,
    ],
    queryFn: () => searchCasesByPolicyNumber(policyNumber, planCode),
    select: data =>
      (data || [])
        .map(parseNotifications)
        .filter(notification => !!notification),
    initialData: initialNotifications,
    enabled: shouldFetchClientSideNotifications,
  });

  const { completedNotifications, actionNeededNotifications } =
    notifications.reduce(transformNotifications, {
      completedNotifications: [],
      actionNeededNotifications: [],
    });

  const handleAcknowledge = (notificationId: string) =>
    setAcknowledgedNotifications(oldNotifications =>
      acknowledgeNotifications(oldNotifications, notificationId)
    );

  const showLoader = isLoading || isFetching || !isClient;

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

const NotificationCenterSection = ({
  notifications: items,
  isClient,
  acknowledgedNotifications,
  isLoading,
  handleAcknowledge,
  variant,
  sectionHeading,
  className,
}: {
  variant: AssistiveTextVariant;
  sectionHeading: string;
  notifications: NotificationCenterNotification[];
  isClient: boolean;
  acknowledgedNotifications?: string[];
  isLoading: boolean;
  className?: string;
  handleAcknowledge: (id: string) => void;
}) => {
  return (
    <section className={clsx(Styles.list, className?.length && className)}>
      <h2>
        <AssistiveText
          className={Styles.heading}
          text={sectionHeading}
          variant={variant}
        />
      </h2>
      <ul>
        {items.map(notification => (
          <Suspense
            key={notification.id}
            fallback={NotificationCenterItemLoadingState}
          >
            <NotificationCenterItem
              isClient={isClient}
              onAcknowledge={handleAcknowledge}
              notification={notification}
              loading={isLoading}
              needsAcknowledgement={
                !notification.completed &&
                !acknowledgedNotifications?.includes(notification.id)
              }
              sidesheetLinkText={
                notification.completed
                  ? 'More Info'
                  : `Case ID ${notification.id}`
              }
            />
          </Suspense>
        ))}
      </ul>
    </section>
  );
};

const NotificationCenterItem = ({
  notification,
  sidesheetLinkText,
  loading,
  needsAcknowledgement,
  onAcknowledge,
  isClient,
}: {
  onAcknowledge: (id: string) => void;
  needsAcknowledgement: boolean;
  notification: NotificationCenterNotification;
  loading: boolean;
  isClient: boolean;
  sidesheetLinkText: string;
}) => {
  const notificationDate = dayjs(notification.date);
  const dateIsToday = notificationDate.isSame(today, 'day');
  let dateText;
  if (dateIsToday) {
    dateText = 'Today';
  } else {
    const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' });
    dateText = formatter.format(notification.date);
  }

  if (loading || !isClient) return NotificationCenterItemLoadingState;

  const fieldData = {
    'Case ID': notification.id,
    'Completion Date': notificationDate.format('MM/DD/YYYY'),
    Transaction: notification.title,
  };

  return (
    <NotificationCenterSidesheet
      caseId={notification.id}
      title={notification.title}
      fields={Object.entries(fieldData).map(([key, value]) => ({
        label: key,
        value,
      }))}
    >
      <button
        onClick={() => onAcknowledge(notification.id)}
        className={clsx(
          Styles.item,
          needsAcknowledgement && Styles.needsAcknowledgement
        )}
      >
        <h3 className={clsx(Styles.title, 'typography-labels-label-sm')}>
          {needsAcknowledgement && <div className={Styles.pip}></div>}
          {notification.title}
        </h3>
        <div className={clsx(Styles.date, 'typography-content-caption')}>
          <Icon small type={IconType.CALENDAR} />
          {dateText}
        </div>

        <span className={clsx(Styles.link, 'typography-nav-links-sm')}>
          {sidesheetLinkText}
        </span>
      </button>
    </NotificationCenterSidesheet>
  );
};

const NotificationCenterItemLoadingState = (
  <div className={Styles.item}>
    <SkeletonLoader className={Styles.title} width="100%" height="1.5rem" />
    <div className={Styles.date}>
      <Icon small type={IconType.CALENDAR} />
      <SkeletonLoader width="8ch" height="1.5rem" />
    </div>
    <SkeletonLoader className={Styles.link} width="50%" height="1.5rem" />
  </div>
);
