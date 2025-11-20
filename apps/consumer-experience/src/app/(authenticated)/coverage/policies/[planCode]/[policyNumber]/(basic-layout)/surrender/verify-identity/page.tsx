import { MFAStep } from '@/components/stepped-workflow/workflows/surrender/forms/MFAStep';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';

const VerifyIdentityPage = () => {
  return (
    <Surrender currentStepOverride={6}>
      <MFAStep />
    </Surrender>
  );
};
export default VerifyIdentityPage;
