import { IntroPage } from '@/components/stepped-workflow/workflows/withdrawals/forms/IntroPage';
import { Withdrawals } from '@/components/stepped-workflow/workflows/withdrawals/Withdrawals';
import { PolicyRequestInputsParams } from '@/types/policy';

const InformationPage = ({ params }: PolicyRequestInputsParams) => {
  return (
    <Withdrawals
      planCode={params.planCode}
      policyNumber={params.policyNumber}
      currentStepOverride={0}
    >
      <IntroPage />
    </Withdrawals>
  );
};

export default InformationPage;
