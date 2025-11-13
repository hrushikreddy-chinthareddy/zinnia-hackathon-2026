import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CaseInstanceSummary } from '@xd/api-types/dist/generated-types/case';

import {
  parseNotifications,
  transformNotifications,
} from '@/components/notification-center/utils';
import { acknowledgeCase } from '@/queries/case-queries';
import { QueryKeys } from '@/queries/query-keys';
import { acknowledgedCasesOptions } from '@/queries/query-options';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { useFeatureFlagsFor } from './use-feature-flags';

interface UseAcknowledgeCasesParams {
  planCode: string;
  policyNumber: string;
  fetchNotificationsFlagEnabled?: boolean;
}

export const useNotifications = ({
  planCode,
  policyNumber,
  initialNotifications,
}: {
  planCode: string;
  policyNumber: string;
  initialNotifications?: CaseInstanceSummary[] | null;
}) => {
  const { data: fetchNotificationsFlag } = useFeatureFlagsFor(
    FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS
  );

  return useQuery({
    queryKey: [
      QueryKeys.NOTIFICATIONS,
      policyNumber,
      planCode,
      initialNotifications,
    ],
    queryFn: async () => {
      const data = await searchCasesByPolicyNumber(policyNumber, planCode);
      console.log('data', data);
      return data;
    },
    select: data => {
      const { completedNotifications, actionNeededNotifications } = (data || [])
        .map(parseNotifications)
        .filter(notification => !!notification)
        .reduce(transformNotifications, {
          completedNotifications: [],
          actionNeededNotifications: [],
        });

      return {
        completedNotifications,
        actionNeededNotifications,
        allNotifications: [
          ...completedNotifications,
          ...actionNeededNotifications,
        ],
      };
    },
    initialData: initialNotifications,
    enabled: !!fetchNotificationsFlag,
  });
};

export const useAcknowledgedCases = ({
  planCode,
  policyNumber,
  fetchNotificationsFlagEnabled = false,
  initialAcknowledgedNotifications,
}: UseAcknowledgeCasesParams) => {
  return useQuery({
    ...acknowledgedCasesOptions({ planCode, policyNumber }),
    enabled:
      fetchNotificationsFlagEnabled &&
      !!policyNumber.length &&
      !!planCode.length,
  });
};

export const useMarkAsRead = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      stepsToAcknowledge,
    }: {
      id: string;
      stepsToAcknowledge: string[];
    }) =>
      acknowledgeCase({
        acknowledgedIds: stepsToAcknowledge,
        caseId: id,
        planCode,
        policyNumber,
      }),
    onSuccess: () => {
      // refetch the notifications to get the updated list
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.NOTIFICATIONS],
      });
    },
  });
};

export const useMarkAllAsRead = ({
  planCode,
  policyNumber,
  notifications,
}: {
  planCode: string;
  policyNumber: string;
  notifications: { id: string; stepsToAcknowledge: string[] }[];
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      Promise.all(
        notifications.map(notification =>
          acknowledgeCase({
            acknowledgedIds: notification.stepsToAcknowledge,
            caseId: notification.id,
            planCode,
            policyNumber,
          })
        )
      ),
    onSuccess: () => {
      // refetch the notifications to get the updated list
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.NOTIFICATIONS],
      });
    },
  });

  return mutation;
};
