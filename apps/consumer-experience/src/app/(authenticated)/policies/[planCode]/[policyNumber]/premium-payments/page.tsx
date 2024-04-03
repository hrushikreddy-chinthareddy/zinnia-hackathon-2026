import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
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
      <HeaderPolicyDetails
        planCode={params.planCode}
        policyNumber={params.policyNumber}
      />
      <UpcomingPremium
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        extended
      />
      <Footer />
    </div>
  );
}
