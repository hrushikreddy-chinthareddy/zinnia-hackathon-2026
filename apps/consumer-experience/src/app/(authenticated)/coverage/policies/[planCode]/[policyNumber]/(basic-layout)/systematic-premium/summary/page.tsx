import { SummaryPage } from '@/components/workflows/systematic-premiums/forms/SummaryPage';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';

const BankPage = () => {
  return (
    <SystematicPremiums
      currentStepOverride={2}
    >
      <SummaryPage />
    </SystematicPremiums>
  );
};

export default BankPage;
