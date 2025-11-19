import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { PolicyStatusAlertBanner } from '@/components/policy-status-alert-banner/PolicyStatusAlertBanner';
import { getPolicyStatusDetails } from '@/services';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: {
    template: '%s | MyPolicyView',
    default: 'Contract',
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
  const loggingContext = await buildCommonLogContext();
  const { data } = await getPolicyStatusDetails(
    { planCode, policyNumber },
    loggingContext
  );

  return (
    <>
      <PolicyStatusAlertBanner
        policyStatusData={data}
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        lineOfBusiness={LineOfBusiness.ANNUITY}
      />
      <div className="container">{children}</div>
      <Footer />
    </>
  );
}
