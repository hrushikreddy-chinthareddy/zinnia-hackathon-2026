import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NotificationCenter } from '@/components/notification-center/NotificationCenter';
import { getPageTitle, RouteKey } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
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
  const notificationViewEnabled =
    flags?.[FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS];

  if (!notificationViewEnabled) return notFound();

  return (
    <NotificationCenter
      policyNumber={params.policyNumber}
      planCode={params.planCode}
      lineOfBusiness={LineOfBusiness.ANNUITY}
    />
  );
}
