import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { PolicyDetailPageHeader } from '@/components/policy-detail-page-header/PolicyDetailPageHeader';
import { PolicyStatusAlertBanner } from '@/components/policy-status-alert-banner/PolicyStatusAlertBanner';
import { getPolicyStatusDetails } from '@/services';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: {
    template: '%s | MyPolicyView',
    default: 'Policy',
  },
};

export default async function AuthenticatedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  const { planCode, policyNumber } = params;
  const { data } = await getPolicyStatusDetails({ planCode, policyNumber });
  return (
    <>
      <PolicyStatusAlertBanner
        policyStatusData={data}
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        lineOfBusiness={LineOfBusiness.LIFE}
      />
      <PolicyDetailPageHeader />
      <div className="container">{children}</div>
      <Footer />
    </>
  );
}
