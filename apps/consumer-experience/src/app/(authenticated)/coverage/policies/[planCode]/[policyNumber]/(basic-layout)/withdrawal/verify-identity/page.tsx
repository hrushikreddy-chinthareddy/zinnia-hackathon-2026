import { MFAStep } from '@/components/stepped-workflow/workflows/withdrawals/forms/MFAStep';
import { Withdrawals } from '@/components/stepped-workflow/workflows/withdrawals/Withdrawals';
import { PolicyRequestInputsParams } from '@/types/policy';

const VerifyIdentityPage = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Withdrawals
      planCode={params.planCode}
      policyNumber={params.policyNumber}
      currentStepOverride={7}
    >
      <MFAStep />
    </Withdrawals>
  );
};
export default VerifyIdentityPage;
