import { WithdrawalMethod } from '@/components/stepped-workflow/workflows/withdrawals/forms/WithdrawalMethod';
import { Withdrawals } from '@/components/stepped-workflow/workflows/withdrawals/Withdrawals';
import { PolicyRequestInputsParams } from '@/types/policy';

const FundsPage = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Withdrawals
      planCode={params.planCode}
      policyNumber={params.policyNumber}
      currentStepOverride={2}
    >
      <WithdrawalMethod />
    </Withdrawals>
  );
};

export default FundsPage;
