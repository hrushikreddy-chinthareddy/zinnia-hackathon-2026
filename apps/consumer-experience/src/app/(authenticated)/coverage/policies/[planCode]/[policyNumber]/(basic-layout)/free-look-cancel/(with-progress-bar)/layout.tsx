import { TransactionProgressHeader } from '@/components/stepped-workflow/common/TransactionProgressHeader';
import { stepsInfo } from '@/components/stepped-workflow/workflows/free-look-cancel/steps';

export default async function FreeLookCancelFlowWithProgressBar({
  params,
  children,
}: {
  children: React.ReactNode;
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  const baseUrl = `/coverage/policies/${params.planCode}/${params.policyNumber}`;
  return (
    <>
      <TransactionProgressHeader stepsInfo={stepsInfo} baseUrl={baseUrl} />
      {children}
    </>
  );
}
