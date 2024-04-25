import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { UpcomingPremium } from '@/components/policy-overview/UpcomingPremium';
import { PolicyRequestInputs } from '@/types/policy';

export default async function PremiumPayments({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  return (
    <div className="container">
      <HeaderBreadcrumb title="Premium payments" />
      <UpcomingPremium
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        extended
      />
      <CallForAssistance customInstruction="to make a payment." />
    </div>
  );
}
