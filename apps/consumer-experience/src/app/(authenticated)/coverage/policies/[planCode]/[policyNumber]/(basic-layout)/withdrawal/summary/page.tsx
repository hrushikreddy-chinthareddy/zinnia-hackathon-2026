import { SummaryPage } from '@/components/workflows/withdrawals/forms/SummaryPage';
import { Withdrawals } from '@/components/workflows/withdrawals/Withdrawals';
import { PolicyRequestInputsParams } from '@/types/policy';

const BankPage = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Withdrawals
      planCode={params.planCode}
      policyNumber={params.policyNumber}
      currentStepOverride={6}
    >
      <SummaryPage />
    </Withdrawals>
  );
};

export default BankPage;
