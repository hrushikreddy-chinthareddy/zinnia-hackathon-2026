import { SubmissionPage } from '@/components/workflows/systematic-premiums/forms/SubmissionPage';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';

const SubmissionStep = () => {
  return (
    <SystematicPremiums currentStepOverride={3}>
      <SubmissionPage />
    </SystematicPremiums>
  );
};

export default SubmissionStep;
