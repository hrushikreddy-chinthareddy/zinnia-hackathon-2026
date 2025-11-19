import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QueryKeys } from '@/queries/query-keys';
import { markAllAsReadMutationOptions } from '@/queries/query-options';

import { NotificationCenterNotification } from '../types';
import { createAllAcknowledgedEntries } from '../utils';

/**
 *
 * Mark all as read
 */
export const useMarkAllReadMutate = ({
  planCode,
  policyNumber,
  allNotifications,
}: {
  planCode: string;
  policyNumber: string;
  allNotifications: NotificationCenterNotification[];
}) => {
  const acknowledgedQueryKey = [
    QueryKeys.NOTIFICATIONS,
    QueryKeys.NOTIFICATION_ACKNOWLEDGMENT,
  ];
  const queryClient = useQueryClient();
  return useMutation({
    ...markAllAsReadMutationOptions({
      planCode,
      policyNumber,
      notifications: allNotifications.map(notification => ({
        id: notification.id,
        stepsToAcknowledge: notification.stepsToAcknowledge ?? [],
      })),
    }),
    async onMutate() {
      await queryClient.cancelQueries({ queryKey: acknowledgedQueryKey });

      const previousAcknowledged =
        queryClient.getQueryData(acknowledgedQueryKey);

      queryClient.setQueryData(acknowledgedQueryKey, () =>
        createAllAcknowledgedEntries(planCode, policyNumber, allNotifications)
      );

      return { previousAcknowledged };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousAcknowledged) {
        queryClient.setQueryData(
          acknowledgedQueryKey,
          context.previousAcknowledged
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: acknowledgedQueryKey });
    },
  });
};
