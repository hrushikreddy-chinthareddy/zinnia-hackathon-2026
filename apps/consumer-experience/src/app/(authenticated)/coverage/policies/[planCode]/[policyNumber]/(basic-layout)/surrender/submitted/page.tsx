import { SubmissionPage } from '@/components/workflows/surrender/forms/SubmissionPage';
import Surrender from '@/components/workflows/surrender/Surrender';
import { PolicyRequestInputsParams } from '@/types/policy';

const SubmissionStep = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Surrender currentStepOverride={7}>
      <SubmissionPage />
    </Surrender>
  );
};

export default SubmissionStep;
