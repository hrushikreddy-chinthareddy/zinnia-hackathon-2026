import { QueryClient } from '@tanstack/react-query';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { ProfileView } from '@/app/(authenticated)/coverage/shared-views/ProfileView';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { QueryKeys } from '@/queries/query-keys';
import { getPageTitle, RouteKey } from '@/route-map';
import { getPolicyProfileData } from '@/services';
import { PolicyProfile, PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

const pageTitle = getPageTitle(RouteKey.PROFILE);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

interface Props {
  params: PolicyRequestInputs;
}

export default async function Profile({ params }: Props) {
  let profileData = {} as PolicyProfile;
  let isError = false;

  const loggingContext = await buildCommonLogContext();
  const { data, error } = await getPolicyProfileData(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  profileData = data!;
  isError = !!error;

  const queryClient = new QueryClient();

  queryClient.setQueryData([QueryKeys.POLICY_PROFILE], profileData);

  if (isError) {
    return (
      <div className="space-mb-gap-lg">
        <NoDataAvailable
          iconType={IconType.CIRCLE_USER}
          message="There is currently no profile data available."
        />
      </div>
    );
  }

  return (
    <ProfileView
      profileData={profileData}
      planCode={params.planCode}
      policyNumber={params.policyNumber}
      lineOfBusiness={LineOfBusiness.LIFE}
    />
  );
}
