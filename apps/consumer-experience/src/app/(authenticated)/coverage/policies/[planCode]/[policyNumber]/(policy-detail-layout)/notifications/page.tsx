import { QueryClient } from '@tanstack/react-query';
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { NotificationCenter } from '@/components/notification-center/NotificationCenter';
import { QueryKeys } from '@/queries/query-keys';
import { getPageTitle, RouteKey } from '@/route-map';
import { getPolicyProfileData } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';

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
  const { data, error } = await getPolicyProfileData({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });
  const queryClient = new QueryClient();

  queryClient.setQueryData([QueryKeys.NOTIFICATIONS], data);

  if (error) {
    return (
      <div className="space-mb-gap-lg">
        <MockMessage />
        <NoDataAvailable
          iconType={IconType.CIRCLE_USER}
          message="There is currently no notifications data available."
        />
      </div>
    );
  }

  return <NotificationCenter notifications={[]} />;
}
