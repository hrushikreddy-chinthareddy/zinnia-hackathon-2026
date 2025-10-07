import { SubmissionPage } from '@/components/stepped-workflow/workflows/systematic-premiums/forms/SubmissionPage';
import { SystematicPremiums } from '@/components/stepped-workflow/workflows/systematic-premiums/SystematicPremiums';

const SubmissionStep = () => {
  return (
    <SystematicPremiums currentStepOverride={3}>
      <SubmissionPage />
    </SystematicPremiums>
  );
};

export default SubmissionStep;
