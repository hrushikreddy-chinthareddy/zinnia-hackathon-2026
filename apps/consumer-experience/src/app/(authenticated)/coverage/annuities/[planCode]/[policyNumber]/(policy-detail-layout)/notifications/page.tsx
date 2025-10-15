import { CaseInstanceSummary } from '@zinnia/api-types/types/case';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NotificationCenter } from '@/components/notification-center/NotificationCenter';
import { getPageTitle, RouteKey } from '@/route-map';
import { searchCases } from '@/services/case';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { logError } from '@/utils/logging/log-fns';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
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
  const loggingCtx = await buildCommonLogContext();
  let initialNotifications: Array<CaseInstanceSummary> | undefined;
  const notificationViewEnabled =
    flags?.[FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS];

  if (!notificationViewEnabled) return notFound();

  const { data: cases, error } = await searchCases(
    {
      policyNumber: params.policyNumber,
    },
    loggingCtx
  );

  if (cases?.data && cases.data.length > 0) {
    initialNotifications = cases.data;
  }

  //TODO: Do we need an error state?
  if (error) {
    logError('Error fetching notifications', error);
    initialNotifications = undefined;
  }

  return (
    <NotificationCenter
      policyNumber={params.policyNumber}
      planCode={params.planCode}
      initialNotifications={initialNotifications}
    />
  );
}
