import { Metadata } from 'next';

import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { baseAppUrl } from '@/services/api-config';
import { serverApi } from '@/services/server';

import { AccountValue } from './_policy-overview/AccountValue';
import { Coverage } from './_policy-overview/Coverage';
import styles from './_policy-overview/PolicyOverview.module.css';
import { UpcomingPremium } from './_policy-overview/UpcomingPremium';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Home page',
};

export default async function Home() {
  const policyOverviewData = await Promise.allSettled([
    serverApi.get(`${baseAppUrl}/api/policies/2345`),
    serverApi.get(`${baseAppUrl}/api/policy-riders`),
  ]);

  const policyResult = policyOverviewData?.[0];
  const ridersResult = policyOverviewData?.[1];

  // TODO: error handling
  if (policyResult.status === 'rejected') {
    return null;
  }

  const policyData = policyResult.value?.data;
  const ridersData =
    ridersResult.status === 'fulfilled' ? ridersResult.value.data : [];

  return (
    <>
      <HeaderBreadcrumb title="Policy overview" />
      <HeaderPolicyDetails
        className="my-lg"
        {...policyData.policyDetails}
        policyStatus={policyData.policyDetails.policyStatus}
      />
      <div className={styles.cardContainer}>
        <UpcomingPremium
          {...policyData.upcomingPremium}
          policyStatus={policyData.policyDetails.policyStatus}
        />
        <AccountValue
          {...policyData.accountValue}
          policyStatus={policyData.policyDetails.policyStatus}
        />
        <Coverage
          {...policyData.coverage}
          policyStatus={policyData.policyDetails.policyStatus}
          riders={ridersData}
        />
      </div>
    </>
  );
}
