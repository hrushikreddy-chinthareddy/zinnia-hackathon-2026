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
      <HeaderPolicyDetails includeLogo expanded />

      <h1 className=" my-4 sm:my-6">Policy Overview</h1>

      <div className="[&>*]:mb-4">
        <UpcomingPremium />
        <AccountValue />
        <Coverage />
      </div>

      <Footer />
    </>
  );
}
