import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';

import { AccountValue } from './_policy-overview/AccountValue';
import { Coverage } from './_policy-overview/Coverage';
import { UpcomingPremium } from './_policy-overview/UpcomingPremium';

export const metadata: Metadata = {
  title: 'Home page',
};

export default function Home() {
  return (
    <>
      <HeaderBreadcrumb title="Policy overview" />
      <HeaderPolicyDetails
        className="my-dimension-gap-lg"
        includeLogo
        expanded
      />

      <div className="[&>*]:mb-4">
        <UpcomingPremium />
        <AccountValue />
        <Coverage />
      </div>

      <Footer />
    </>
  );
}
