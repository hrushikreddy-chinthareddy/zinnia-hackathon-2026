import { MFAStep } from '@/components/stepped-workflow/workflows/surrender/forms/MFAStep';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';
import { PolicyRequestInputsParams } from '@/types/policy';

const VerifyIdentityPage = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Surrender currentStepOverride={6}>
      <MFAStep />
    </Surrender>
  );
};
export default VerifyIdentityPage;
