import { WithdrawalAmountForm } from '@/components/workflows/withdrawals/forms/WithdrawalAmountForm';
import { Withdrawals } from '@/components/workflows/withdrawals/Withdrawals';
import { PolicyRequestInputsParams } from '@/types/policy';

const AmountPage = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Withdrawals
      currentStepOverride={1}
      planCode={params.planCode}
      policyNumber={params.policyNumber}
    >
      <WithdrawalAmountForm />
    </Withdrawals>
  );
};

export default AmountPage;
