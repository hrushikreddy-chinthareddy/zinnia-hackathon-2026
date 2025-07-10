import { CaseInstanceSummary } from '@zinnia/api-types/types/case';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NotificationCenter } from '@/components/notification-center/NotificationCenter';
import { getPageTitle, RouteKey } from '@/route-map';
import { searchCasesByPolicyNumber } from '@/services/case';
import { getFeatureFlags } from '@/services/feature-flags';
import {
  CaseAcknowledgmentItem,
  fetchAcknowledgedCases,
} from '@/services/terms-and-conditions';
import { PolicyRequestInputs } from '@/types/policy';
import { logError } from '@/utils/logging/log-fns';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

const pageTitle = getPageTitle(RouteKey.NOTIFICATIONS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

interface Props {
  params: PolicyRequestInputs;
}

export default async function NotificationsPage({ params }: Props) {
  const flags = await getFeatureFlags();
  let initialNotifications: Array<CaseInstanceSummary> | undefined;
  let initialAcknowledgedNotifications: Array<CaseAcknowledgmentItem> = [];
  const notificationViewEnabled =
    flags?.[FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS];

  if (!notificationViewEnabled) return notFound();

  const { data: cases, error } = await searchCasesByPolicyNumber({
    policyNumber: params.policyNumber,
  });

  if (
    cases &&
    [cases, params.planCode, params.policyNumber].every(arr => arr.length > 0)
  ) {
    initialNotifications = cases;
    const { data: acknowledgedCases, error: acknowledgedCasesError } =
      await fetchAcknowledgedCases({
        planCode: params.planCode,
        policyNumber: params.policyNumber,
      });

    if (!acknowledgedCasesError && !!acknowledgedCases?.length) {
      initialAcknowledgedNotifications = acknowledgedCases;
    }
  }

  if (error) {
    logError('Error fetching notifications', error);
    initialNotifications = undefined;
  }

  return (
    <NotificationCenter
      policyNumber={params.policyNumber}
      planCode={params.planCode}
      initialNotifications={initialNotifications}
      initialAcknowledgedNotifications={initialAcknowledgedNotifications}
    />
  );
}
