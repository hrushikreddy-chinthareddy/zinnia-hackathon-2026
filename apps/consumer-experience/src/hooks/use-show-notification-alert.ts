import { useQuery } from '@tanstack/react-query';
import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';

import { parseNotifications } from '@/components/notification-center/utils';
import {
  acknowledgedCasesOptions,
  searchCasesByPolicyNumberOptions,
} from '@/queries/query-options';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { useFeatureFlagsFor } from './use-feature-flags';

interface UseShowNotificationsBasedOnParams {
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
}

export const useShowNotificationAlertBasedOn = ({
  planCode,
  policyNumber,
  lineOfBusiness,
}: UseShowNotificationsBasedOnParams) => {
  const { data: fetchNotificationsFlagEnabled } = useFeatureFlagsFor(
    FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS
  );

  const { data: casesInException } = useQuery({
    ...searchCasesByPolicyNumberOptions({
      planCode,
      policyNumber,
      lineOfBusiness,
    }),
    select: ({ data }) => {
      return (data || [])
        .map(parseNotifications)
        .filter(notification => !!notification && !notification.completed);
    },
    enabled: !!fetchNotificationsFlagEnabled && !!policyNumber && !!planCode,
  });

  const {
    data: showNotificationAlert = false,
    isLoading: acknowledgedNotificationsLoading,
  } = useQuery({
    ...acknowledgedCasesOptions({
      planCode,
      policyNumber,
    }),
    select: data => {
      if (data == null) data = [];
      // if there are no cases in exception
      // don't show the icon
      if (!casesInException?.length) return false;
      const casesWithUnacknowledgedSteps = casesInException.some(
        caseInException => {
          // if there are no steps to acknowledge,
          // (i.e. the case is IN_PROGRESS instead of EXCEPTION),
          //  don't show the icon
          if (!caseInException?.stepsToAcknowledge?.length) return false;

          // find the notification that matches the case in exception
          const caseNotification = data.find(
            c => c.caseId === caseInException?.id
          );

          // if there is no previously acknowledged notification for this case
          // show the icon
          if (!caseNotification) return true;

          // get the previously acknowledged steps
          const previouslyAcknowledgedSteps = caseNotification.acknowledgedIds;

          return (
            // make sure every step that is causing the exception
            !caseInException.stepsToAcknowledge.every(id =>
              // has been previously acknowledged
              previouslyAcknowledgedSteps?.includes(id)
            )
          );
        }
      );

      // if there are any cases with unacknowledged steps, show the icon
      return casesWithUnacknowledgedSteps;
    },
    enabled:
      !!fetchNotificationsFlagEnabled &&
      !!planCode?.length &&
      !!policyNumber?.length &&
      !!casesInException?.length,
  });

  return {
    showNotificationAlert,
    acknowledgedNotificationsLoading,
  };
};
