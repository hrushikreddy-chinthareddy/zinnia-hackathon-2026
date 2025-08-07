import { SummaryPage } from '@/components/workflows/surrender/forms/SummaryPage';
import Surrender from '@/components/workflows/surrender/Surrender';
import { PolicyRequestInputsParams } from '@/types/policy';

const BankPage = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Surrender currentStepOverride={5}>
      <SummaryPage />
    </Surrender>
  );
};

export default BankPage;
