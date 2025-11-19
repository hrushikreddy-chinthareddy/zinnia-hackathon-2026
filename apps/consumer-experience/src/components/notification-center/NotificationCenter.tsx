'use client';
import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';

import { NotificationCenterSection } from '@/components/notification-center/section/NotificationCenterSection';
import { useFeatureFlagsFor } from '@/hooks/use-feature-flags';
import {
  acknowledgedCasesOptions,
  caseQueryOptions,
} from '@/queries/query-options';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { default as Styles } from './NotificationCenter.module.css';
import { NotificationCenterProps } from './types';
import { selectNotifications, sortNotificationsByDate } from './utils';
import { Button } from '../button/Button';
import { useAcknowledgeCaseMutate } from './hooks/use-acknowledge-case-mutate';
import { useMarkAllReadMutate } from './hooks/use-mark-all-read-mutate';

export const NotificationCenter = ({
  policyNumber,
  planCode,
}: NotificationCenterProps) => {
  const { data: fetchNotificationsFlag } = useFeatureFlagsFor(
    FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS
  );

  const {
    data: notifications = {
      completedNotifications: [],
      actionNeededNotifications: [],
      allNotifications: [],
    },
    isLoading,
  } = useQuery({
    ...caseQueryOptions({
      policyNumber,
    }),
    select: selectNotifications,
    enabled:
      !!fetchNotificationsFlag && !!policyNumber.length && !!planCode.length,
  });

  // fetch acknowledged notifications
  const { data: acknowledgedNotifications = [] } = useQuery({
    ...acknowledgedCasesOptions({ planCode, policyNumber }),
    enabled:
      !!fetchNotificationsFlag && !!policyNumber.length && !!planCode.length,
  });

  // all notifications = completed + action needed notifications
  const { allNotifications } = notifications;

  const markAllAsReadMutation = useMarkAllReadMutate({
    planCode,
    policyNumber,
    allNotifications,
  });

  const acknowledgedCaseMutation = useAcknowledgeCaseMutate({
    planCode,
    policyNumber,
  });

  const handleAcknowledge = (id: string, stepsToAcknowledge: string[]) => {
    acknowledgedCaseMutation.mutate({ id, stepsToAcknowledge });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className={Styles.container}>
      <div className={Styles.markAllReadContainer}>
        <Icon
          small
          type={IconType.CIRCLE_CHECKMARK}
          color="rgba(0, 98, 139, 1)"
        />
        <Button mode="link" size="small" onClick={handleMarkAllAsRead}>
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
        />
      )}
    </div>
  );
};
