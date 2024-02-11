import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
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
      <h1 className="">Policy Overview</h1>
      <HeaderPolicyDetails className="my-4 sm:my-6" includeLogo expanded />
      <div className="[&>*]:mb-4">
        <UpcomingPremium />
        <AccountValue />
        <Coverage />
      </div>

      <Footer />
    </>
  );
}
