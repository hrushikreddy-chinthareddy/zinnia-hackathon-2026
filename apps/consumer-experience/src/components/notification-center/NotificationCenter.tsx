'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CaseInstanceSummary } from '@zinnia/api-types/types/case';
import {
  AssistiveTextVariant,
  Icon,
  IconType,
  Loader,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { NotificationCenterSection } from '@/components/notification-center/section/NotificationCenterSection';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import {
  acknowledgeCase,
  getAcknowledgedCases,
  searchCasesByPolicyNumber,
} from '@/queries/case-queries';
import { QueryKeys } from '@/queries/query-keys';
import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { default as Styles } from './NotificationCenter.module.css';
import {
  parseNotifications,
  sortNotificationsByDate,
  transformNotifications,
} from './utils';

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

export const NotificationCenter = ({
  initialAcknowledgedNotifications,
  initialNotifications,
  policyNumber,
  planCode,
}: NotificationCenterProps) => {
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  const { data: featureFlags } = useFeatureFlags();
  const fetchNotificationsFlag =
    featureFlags?.[FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shouldFetchClientSideNotifications =
    !!fetchNotificationsFlag && isClient;

  const {
    data: acknowledgedNotifications = [],
    isLoading: acknowledgedNotificationsLoading,
    isError: _acknowledgedNotificationsError,
  } = useQuery({
    queryKey: [QueryKeys.NOTIFICATIONS],
    queryFn: () => {
      return getAcknowledgedCases({ policyNumber, planCode });
    },
    initialData: initialAcknowledgedNotifications,
    enabled: shouldFetchClientSideNotifications,
  });

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

  const handleAcknowledge = (id: string, stepsToAcknowledge: string[]) =>
    mutation.mutate({ id, stepsToAcknowledge });

  const { completedNotifications, actionNeededNotifications } =
    notifications.reduce(transformNotifications, {
      completedNotifications: [],
      actionNeededNotifications: [],
    });

  const showLoader =
    acknowledgedNotificationsLoading ||
    !isClient ||
    isLoading ||
    isFetching ||
    mutation.isPending;

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
          mutatingId={mutation?.variables?.id}
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
