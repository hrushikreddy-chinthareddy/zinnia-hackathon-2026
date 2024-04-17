import '@/app/styles/globals.css';

import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';

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
      <HeaderPolicyDetails
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        className="mb-lg"
        useAsLink
      />
      {children}
    </>
  );
}
