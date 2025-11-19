import { SubmissionPage } from '@/components/stepped-workflow/workflows/surrender/forms/SubmissionPage';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';

const SubmissionStep = () => {
  return (
    <Surrender currentStepOverride={7}>
      <SubmissionPage />
    </Surrender>
  );
};

export default SubmissionStep;
