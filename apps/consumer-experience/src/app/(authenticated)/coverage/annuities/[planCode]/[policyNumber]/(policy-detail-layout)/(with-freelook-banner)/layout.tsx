import '@/app/styles/globals.css';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import styles from '@/app/(authenticated)/coverage/shared-styles/Layout.module.css';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { PolicyStatusAlertBanner } from '@/components/policy-status-alert-banner/PolicyStatusAlertBanner';

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
  return (
    <>
      <PolicyStatusAlertBanner
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        canShowFreelookBanner
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
