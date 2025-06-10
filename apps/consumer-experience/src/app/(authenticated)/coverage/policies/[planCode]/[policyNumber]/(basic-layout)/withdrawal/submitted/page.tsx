import { SubmissionPage } from '@/components/workflows/withdrawals/forms/SubmissionPage';
import { Withdrawals } from '@/components/workflows/withdrawals/Withdrawals';
import { PolicyRequestInputsParams } from '@/types/policy';

const SubmissionStep = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Withdrawals
      planCode={params.planCode}
      policyNumber={params.policyNumber}
      currentStepOverride={8}
    >
      <SubmissionPage />
    </Withdrawals>
  );
};

export default SubmissionStep;
