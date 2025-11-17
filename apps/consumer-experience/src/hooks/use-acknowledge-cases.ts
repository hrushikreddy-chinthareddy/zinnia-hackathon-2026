import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsClient } from '@xd/xd-components/src/hooks/useIsClient';
import { useCallback } from 'react';

import {
  parseNotifications,
  transformNotifications,
} from '@/components/notification-center/utils';
import { acknowledgeCase } from '@/queries/case-queries';
import { QueryKeys } from '@/queries/query-keys';
import {
  acknowledgedCasesOptions,
  caseQueryOptions,
} from '@/queries/query-options';
import { TransformedCaseSearchResponse } from '@/services/case/types';
import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';
import { CaseSummary } from '@/types/case';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { useFeatureFlagsFor } from './use-feature-flags';

interface UseAcknowledgeCasesParams {
  planCode: string;
  policyNumber: string;
  fetchNotificationsFlagEnabled?: boolean;
  initialNotifications?: CaseSummary[] | null;
  initialAcknowledgedNotifications?: CaseAcknowledgmentItem[];
}

export const useAcknowledgeCases = ({
  planCode,
  policyNumber,
  fetchNotificationsFlagEnabled = false,
  initialAcknowledgedNotifications,
}: UseAcknowledgeCasesParams) => {
  const isClient = useIsClient();
  const queryClient = useQueryClient();

  const { data: fetchNotificationsFlag } = useFeatureFlagsFor(
    FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS
  );

  const shouldFetchClientSideNotifications =
    !!fetchNotificationsFlag && isClient;

  const selectNotifications = useCallback(
    (data: TransformedCaseSearchResponse | null | undefined) => {
      return (data?.data || [])
        .map(parseNotifications)
        .filter(notification => !!notification);
    },
    []
  );

  const {
    data: notifications = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    ...caseQueryOptions({ policyNumber }),
    select: selectNotifications,
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
