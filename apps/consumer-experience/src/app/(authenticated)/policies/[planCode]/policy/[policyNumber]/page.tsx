import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { AccountValue } from '@/components/policy-overview/AccountValue';
import { Coverage } from '@/components/policy-overview/Coverage';
import styles from '@/components/policy-overview/PolicyOverview.module.css';
import { UpcomingPremium } from '@/components/policy-overview/UpcomingPremium';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Policy Overview',
};

export default async function Page({
  params,
}: {
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  const { planCode, policyNumber } = params;

  return (
    <>
      <HeaderBreadcrumb title="Policy Overview" />
      <HeaderPolicyDetails />
      <div className={styles.cardContainer}>
        <UpcomingPremium planCode={planCode} policyNumber={policyNumber} />
        <AccountValue />
        <Coverage />
      </div>
      <Footer />
    </>
  );
}
