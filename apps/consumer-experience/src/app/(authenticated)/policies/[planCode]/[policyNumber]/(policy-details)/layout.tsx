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
      {/* TODO: move this into flex with header....sad */}
      <HeaderPolicyDetails
        planCode={params.planCode}
        policyNumber={params.policyNumber}
      />
      {children}
    </>
  );
}
