import { SummaryPage } from '@/components/stepped-workflow/workflows/surrender/forms/SummaryPage';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';

const BankPage = () => {
  return (
    <Surrender currentStepOverride={5}>
      <SummaryPage />
    </Surrender>
  );
};

export default BankPage;
