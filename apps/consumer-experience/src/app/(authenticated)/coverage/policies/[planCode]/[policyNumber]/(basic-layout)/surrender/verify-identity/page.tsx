import { MFAStep } from '@/components/workflows/surrender/forms/MFAStep';
import Surrender from '@/components/workflows/surrender/Surrender';
import { PolicyRequestInputsParams } from '@/types/policy';

const VerifyIdentityPage = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Surrender currentStepOverride={6}>
      <MFAStep />
    </Surrender>
  );
};
export default VerifyIdentityPage;
