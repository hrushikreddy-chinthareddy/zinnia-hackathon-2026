import { Metadata } from 'next';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { UpcomingPremium } from '@/components/policy-overview/UpcomingPremium';
import { RouteKey, getPageTitle } from '@/route-map';
import { PolicyRequestInputs } from '@/types/policy';

const pageTitle = getPageTitle(RouteKey.PREMIUM);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function PremiumPayments({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  return (
    <>
      <UpcomingPremium
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        extended
      />
      <CallForAssistance customInstruction="to make a payment." />
    </>
  );
}
