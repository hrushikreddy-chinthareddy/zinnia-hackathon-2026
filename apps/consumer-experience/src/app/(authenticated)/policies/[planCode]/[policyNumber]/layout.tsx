import '@/app/styles/globals.css';
import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { PolicyStatusAlertBanner } from '@/components/policy-status-alert-banner/PolicyStatusAlertBanner';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: {
    template: '%s | Zinia Tech',
    default: 'Zinnia Tech',
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
      {children}
      <Footer />
    </>
  );
}
