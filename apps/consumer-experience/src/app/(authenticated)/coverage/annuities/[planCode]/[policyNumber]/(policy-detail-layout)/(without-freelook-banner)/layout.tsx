import '@/app/styles/globals.css';
import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { PolicyStatusAlertBanner } from '@/components/policy-status-alert-banner/PolicyStatusAlertBanner';

import styles from '@/app/(authenticated)/coverage/shared-styles/Layout.module.css';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: {
    // TODO: eventually using whatever mechanism we decide to switch carriers, this carrier name will need to be dynamic
    template: '%s - Everly | Zinnia Tech',
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
  return (
    <>
      <PolicyStatusAlertBanner
        planCode={params.planCode}
        policyNumber={params.policyNumber}
      />
      <div className={styles.headerContainer}>
        <HeaderBreadcrumb />
        <HeaderPolicyDetails
          className={styles.policyDetails}
          planCode={params.planCode}
          policyNumber={params.policyNumber}
          lineOfBusiness={LineOfBusiness.ANNUITY}
        />
      </div>
      <div className="container">{children}</div>
      <Footer />
    </>
  );
}
