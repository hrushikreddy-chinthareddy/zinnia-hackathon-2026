'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon, IconType, Pagination } from '@zinnia/bloom/components';
import { useOptimistic } from 'react';

import { NotificationCenterSection } from '@/components/notification-center/section/NotificationCenterSection';
import { useFeatureFlagsFor } from '@/hooks/use-feature-flags';
import { QueryKeys } from '@/queries/query-keys';
import {
  acknowledgedCasesOptions,
  markAllAsReadMutationOptions,
  markAsReadMutationOptions,
  searchCasesByPolicyNumberOptions,
} from '@/queries/query-options';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { default as Styles } from './NotificationCenter.module.css';
import { NotificationCenterProps } from './types';
import { selectNotifications, sortNotificationsByDate } from './utils';
import { Button } from '../button/Button';

export const NotificationCenter = ({
  policyNumber,
  planCode,
  lineOfBusiness,
}: NotificationCenterProps) => {
  const queryClient = useQueryClient();
  const { data: fetchNotificationsFlag } = useFeatureFlagsFor(
    FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS
  );

  // fetch all notifications (the ones that need an action and the completed cases)
  const options = searchCasesByPolicyNumberOptions({
    planCode,
    policyNumber,
    lineOfBusiness,
  });

  const {
    data: notifications = {
      completedNotifications: [],
      actionNeededNotifications: [],
      allNotifications: [],
    },
    isLoading,
  } = useQuery({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
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

  // optimistic update when acknowledging a notification or all notifications
  const [optimisticNotifications, setOptimisticNotifications] = useOptimistic(
    acknowledgedNotifications,
    (
      state,
      // maybe i should split this into two separate useOptimistic hooks
      action: { type: 'acknowledge'; id: string } | { type: 'acknowledgeAll' }
    ) => {
      if (action.type === 'acknowledge') {
        // add notification to array of acknowledged notifications
        // state.push(notification);
        return [
          ...state,
          {
            planCode,
            policyNumber,
            caseId: action.id,
            partyId: '', // We don't have partyId here, but it's only used server-side
            dateAcknowledged: new Date().toISOString(),
            // not sure what to put here
            acknowledgedIds: [],
          },
        ];
      }
      // mall all notifications as acknlowledged
      return allNotifications.map(notification => ({
        planCode,
        policyNumber,
        caseId: notification.id,
        partyId: '',
        dateAcknowledged: new Date().toISOString(),
        // not sure what to put here
        acknowledgedIds: notification.stepsToAcknowledge ?? [],
      }));
    }
  );

  // mutation to acknowledge a specific notification
  const acknowledgedCaseMutation = useMutation({
    ...markAsReadMutationOptions({ planCode, policyNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.NOTIFICATIONS],
      });
    },
  });

  // mutation acknowledge all notifications
  const markAllAsReadMutation = useMutation({
    ...markAllAsReadMutationOptions({
      planCode,
      policyNumber,
      notifications: allNotifications.map(notification => ({
        id: notification.id,
        stepsToAcknowledge: notification.stepsToAcknowledge ?? [],
      })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.NOTIFICATIONS],
      });
    },
  });

  const handleAcknowledge = (id: string, stepsToAcknowledge: string[]) => {
    setOptimisticNotifications({ type: 'acknowledge', id });
    acknowledgedCaseMutation.mutate({ id, stepsToAcknowledge });
  };

  const handleMarkAllAsRead = () => {
    setOptimisticNotifications({ type: 'acknowledgeAll' });
    markAllAsReadMutation.mutate();
  };

  return (
    <div className={Styles.container}>
<<<<<<< HEAD
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
=======
      {allNotifications.length > 0 ? (
>>>>>>> bd49c190a7 (Addressed PR comments)
        <NotificationCenterSection
          className={Styles.actionNeeded}
          notifications={allNotifications.sort(sortNotificationsByDate)}
          handleAcknowledge={handleAcknowledge}
          acknowledgedNotifications={optimisticNotifications}
          isLoading={isLoading}
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
