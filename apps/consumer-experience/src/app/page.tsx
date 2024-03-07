import { Metadata } from 'next';

import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { baseAppUrl } from '@/services/api-config';
import { serverApi } from '@/services/server';

import { AccountValue } from '../components/policy-overview/AccountValue';
import { Coverage } from '../components/policy-overview/Coverage';
import styles from '../components/policy-overview/PolicyOverview.module.css';
import { UpcomingPremium } from '../components/policy-overview/UpcomingPremium';

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

  const policyData =
    policyResult.status !== 'rejected' ? policyResult.value?.data : {};
  const ridersData =
    ridersResult.status === 'fulfilled' ? ridersResult.value.data : [];

  return (
    <>
      <HeaderBreadcrumb title="Policy overview" />
      <HeaderPolicyDetails
        {...policyData?.policyDetails}
        policyStatus={policyData?.policyDetails?.policyStatus}
      />
      <div className={styles.cardContainer}>
        <UpcomingPremium
          {...policyData?.upcomingPremium}
          policyName={policyData.policyDetails?.planName}
          policyStatus={policyData?.policyDetails?.policyStatus}
        />
        <AccountValue
          {...policyData?.accountValue}
          policyStatus={policyData?.policyDetails?.policyStatus}
        />
        <Coverage
          {...policyData?.coverage}
          policyStatus={policyData?.policyDetails?.policyStatus}
          riders={ridersData}
        />
      </div>
    </>
  );
}
