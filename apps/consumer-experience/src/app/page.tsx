import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';

import { AccountValue } from './_policy-overview/AccountValue';
import { Coverage } from './_policy-overview/Coverage';
import styles from './_policy-overview/PolicyOverview.module.css';
import { UpcomingPremium } from './_policy-overview/UpcomingPremium';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Home page',
};

export default function Home() {
  return (
    <>
      <HeaderBreadcrumb title="Policy overview" />
      <HeaderPolicyDetails
        className="my-lg"
        style={{ marginLeft: 0 }}
        expanded
      />
      <div className={styles.cardContainer}>
        <UpcomingPremium />
        <AccountValue />
        <Coverage />
      </div>

      <Footer />
    </>
  );
}
