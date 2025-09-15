import { SummaryForm } from '@/components/workflows/systematic-premiums/forms/Summary/SummaryForm';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';

const SummaryPage = async () => {
  return (
    <SystematicPremiums currentStepOverride={2}>
      <SummaryForm />
    </SystematicPremiums>
  );
};

export default SummaryPage;
