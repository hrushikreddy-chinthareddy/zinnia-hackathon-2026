import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CaseInstanceSummary } from '@xd/api-types/dist/generated-types/case';
import { useIsClient } from '@xd/xd-components/src/hooks/useIsClient';

import {
  parseNotifications,
  transformNotifications,
} from '@/components/notification-center/utils';
import {
  acknowledgeCase,
  searchCasesByPolicyNumber,
} from '@/queries/case-queries';
import { QueryKeys } from '@/queries/query-keys';
import { acknowledgedCasesOptions } from '@/queries/query-options';
import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { useFeatureFlagsFor } from './use-feature-flags';

interface UseAcknowledgeCasesParams {
  planCode: string;
  policyNumber: string;
  fetchNotificationsFlagEnabled?: boolean;
  initialNotifications?: CaseInstanceSummary[] | null;
  initialAcknowledgedNotifications?: CaseAcknowledgmentItem[];
}

export const useAcknowledgeCases = ({
  planCode,
  policyNumber,
  fetchNotificationsFlagEnabled = false,
  initialNotifications,
  initialAcknowledgedNotifications,
}: UseAcknowledgeCasesParams) => {
  const isClient = useIsClient();
  const queryClient = useQueryClient();

  const { data: fetchNotificationsFlag } = useFeatureFlagsFor(
    FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS
  );

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
    queryFn: () => {
      return searchCasesByPolicyNumber(policyNumber, planCode);
    },
    select: data => {
      return (data || [])
        .map(parseNotifications)
        .filter(notification => !!notification);
    },
    initialData: initialNotifications,
    enabled: shouldFetchClientSideNotifications,
  });

  const {
    data: acknowledgedNotifications = [],
    isLoading: acknowledgedNotificationsLoading,
  } = useQuery({
    ...acknowledgedCasesOptions({ planCode, policyNumber }),
    initialData: initialAcknowledgedNotifications,
    enabled:
      fetchNotificationsFlagEnabled &&
      !!policyNumber.length &&
      !!planCode.length,
  });

  const mutation = useMutation({
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

  const { completedNotifications, actionNeededNotifications } =
    notifications.reduce(transformNotifications, {
      completedNotifications: [],
      actionNeededNotifications: [],
    });

  return {
    acknowledgedNotifications,
    acknowledgedNotificationsLoading,
    acknowledgedCaseMutation: mutation,
    completedNotifications,
    actionNeededNotifications,
    notificationsLoading: isLoading,
    notificationsError: isError,
    notificationsFetching: isFetching,
  };
};
