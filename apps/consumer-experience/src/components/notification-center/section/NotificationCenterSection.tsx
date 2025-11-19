import { CaseInstanceSummary } from '@zinnia/api-types/types/case';
import clsx from 'clsx';
import { Suspense } from 'react';

import { NotificationCenterItem } from '@/components/notification-center/item/NotificationCenterItem';
import { default as Styles } from '@/components/notification-center/NotificationCenter.module.css';
import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';

import { NotificationCenterItemLoadingState } from '../loading-state/NotificationCenterLoadingState';

export type NotificationCenterNotification = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  stepsToAcknowledge?: string[];
};

export type NotificationCenterProps = {
  initialNotifications?: Array<CaseInstanceSummary> | null;
  initialAcknowledgedNotifications?: Array<CaseAcknowledgmentItem>;
  policyNumber: string;
  planCode: string;
};

export const NotificationCenterSection = ({
  notifications: items,
  isClient,
  acknowledgedNotifications,
  isLoading,
  handleAcknowledge,
  className,
  mutatingId = '',
}: {
  mutatingId?: string;
  notifications: NotificationCenterNotification[];
  isClient: boolean;
  acknowledgedNotifications: Array<CaseAcknowledgmentItem> | null;
  isLoading: boolean;
  className?: string;
  handleAcknowledge: (id: string, stepsToAcknowledge: string[]) => void;
}) => {
  return (
    <section className={clsx(Styles.list, className?.length && className)}>
      <ul>
        {items.map(notification => {
          const needsAcknowledgement =
            // case has not completed yet
            !notification.completed &&
            // there are steps to acknowledge
            !!notification.stepsToAcknowledge?.length &&
            // if currently mutating
            // don't show pip since we assume
            // the acknowledgment call will return a success
            mutatingId !== notification.id &&
            // if the notification is not already acknowledged
            // from the case acknowledgment api
            !acknowledgedNotifications?.find(
              ({ caseId }) => caseId === notification.id
            );
          return (
            <Suspense
              key={notification.id}
              fallback={NotificationCenterItemLoadingState}
            >
              <NotificationCenterItem
                isClient={isClient}
                onAcknowledge={handleAcknowledge}
                notification={notification}
                loading={isLoading}
                needsAcknowledgement={needsAcknowledgement}
                sidesheetLinkText={'Details'}
              />
            </Suspense>
          );
        })}
      </ul>
    </section>
  );
};
