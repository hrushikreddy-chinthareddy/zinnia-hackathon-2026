import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { HeaderPolicyDetails } from '@/components/policy-detail-page-header/header-policy-details/HeaderPolicyDetails';
import { PolicyDetailPageHeader } from '@/components/policy-detail-page-header/PolicyDetailPageHeader';
import { PolicyStatusAlertBanner } from '@/components/policy-status-alert-banner/PolicyStatusAlertBanner';
import { getPolicyStatusDetails } from '@/services';
import { logTrace } from '@/utils/logging/log-fns';
import {
  buildCommonLogContext,
  LoggingModule,
  LoggingStage,
} from '@/utils/logging/server-logging';

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
  const loggingContext = await buildCommonLogContext();

  if (
    !planCode ||
    planCode === 'undefined' ||
    !policyNumber ||
    policyNumber === 'undefined'
  ) {
    logTrace(
      `${LoggingModule.PAGE}::AuthenticatedLayout::Policy::${LoggingStage.ERROR}`,
      {
        file: 'app/(authenticated)/coverage/policies/[planCode]/[policyNumber]/(policy-detail-layout)/layout.tsx',
        function: 'AuthenticatedLayout',
        error: `Missing planCode or policyNumber in params - planCode: ${planCode}, policyNumber: ${policyNumber}`,
        planCode,
        policyNumber,
        ...loggingContext,
      }
    );
  }

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
        lineOfBusiness={LineOfBusiness.LIFE}
      />
      <PolicyDetailPageHeader>
        <HeaderPolicyDetails
          planCode={params.planCode}
          policyNumber={params.policyNumber}
          lineOfBusiness={LineOfBusiness.LIFE}
        />
      </PolicyDetailPageHeader>
      <div className="container">{children}</div>
      <Footer />
    </>
  );
}
