import { MFAStep } from '@/components/workflows/systematic-premiums/forms/MFAStep';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';

const VerifyIdentityPage = () => {
  return (
    <SystematicPremiums
      currentStepOverride={3}
    >
      <MFAStep />
    </SystematicPremiums>
  );
};
export default VerifyIdentityPage;
