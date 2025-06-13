'use client';

import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useParams, usePathname } from 'next/navigation';

import { Link } from '@/components/link/Link';
import styles from '@/components/nav/Nav.module.css';
import { parseNotifications } from '@/components/notification-center/utils';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import {
  getAcknowledgedCases,
  searchCasesByPolicyNumber,
} from '@/queries/case-queries';
import { QueryKeys } from '@/queries/query-keys';
import { LineOfBusinessPath } from '@/types';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export const NotificationIcon = () => {
  const { data: featureFlags } = useFeatureFlags();

  const fetchNotificationsFlag =
    featureFlags?.[FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS];

  const { policyNumber, planCode } = useParams();
  const lineOfBusinessPath = usePathname().includes(
    LineOfBusinessPath.ANNUITIES
  )
    ? LineOfBusinessPath.ANNUITIES
    : LineOfBusinessPath.POLICIES;

  const { data: casesInException = [], isLoading: _casesInExceptionLoading } =
    useQuery({
      queryKey: [QueryKeys.NOTIFICATIONS, policyNumber, planCode],
      queryFn: () => {
        return searchCasesByPolicyNumber(
          String(policyNumber),
          String(planCode)
        );
      },
      select: data => {
        return (data || [])
          .map(parseNotifications)
          .filter(notification => !!notification && !notification.completed);
      },
    });

  const {
    data: showNotificationAlert = false,
    isLoading: _acknowledgedNotificationsLoading,
  } = useQuery({
    queryKey: [QueryKeys.NOTIFICATIONS, casesInException],
    queryFn: () => {
      return getAcknowledgedCases({
        policyNumber: String(policyNumber),
        planCode: String(planCode),
      });
    },
    select: data => {
      if (data == null) data = [];
      const casesWithUnacknowledgedSteps = casesInException.filter(
        caseInException => {
          // find the notification that matches the case in exception
          const caseNotification = data.find(
            c => c.caseId === caseInException?.id
          );

          // if there is no notification for this case, return true
          // (meaning we want to show the icon)
          if (!caseNotification) return true;

          // get the previously acknowledged steps
          const previouslyAcknowledgedSteps = caseNotification.acknowledgedIds;

          // get list of current steps causing the exception
          const acknowledgedIds = caseInException?.stepsToAcknowledge || [];

          return (
            // every step has been previously acknowledged
            !acknowledgedIds?.every(id =>
              previouslyAcknowledgedSteps?.includes(id)
            )
          );
        }
      );

      // if there are any cases with unacknowledged steps, show the icon
      return casesWithUnacknowledgedSteps.length > 0;
    },
    enabled: !!fetchNotificationsFlag,
  });

  if (!policyNumber || !planCode || !fetchNotificationsFlag) return null;

  return (
    <Link
      isInternal
      href={`/coverage/${lineOfBusinessPath}/${planCode}/${policyNumber}/notifications`}
      className={styles.notification}
    >
      <Icon className={styles.bell} type={IconType.ALERT} />
      {showNotificationAlert && (
        <Icon
          className={styles.exclamation}
          type={IconType.CIRCLE_EXCLAMATION}
        />
      )}
    </Link>
  );
};
