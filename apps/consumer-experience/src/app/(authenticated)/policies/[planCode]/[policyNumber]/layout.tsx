import type { Metadata } from 'next';

import '@/app/styles/globals.css';

import { PolicyStatusAlertBanner } from '@/components/policy-status-alert-banner/PolicyStatusAlertBanner';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Consumer UI',
  description: 'Consumer UI',
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
    </>
  );
}
