import { SummaryForm } from '@/components/stepped-workflow/workflows/systematic-premiums/forms/Summary/SummaryForm';
import { SystematicPremiums } from '@/components/stepped-workflow/workflows/systematic-premiums/SystematicPremiums';

const SummaryPage = async () => {
  return (
    <SystematicPremiums currentStepOverride={2}>
      <SummaryForm />
    </SystematicPremiums>
  );
};

export default SummaryPage;
