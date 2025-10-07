import { IntroPage } from '@/components/stepped-workflow/workflows/surrender/forms/IntroPage';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';
import { PolicyRequestInputsParams } from '@/types/policy';

export default async function ConfirmPage({
  params,
}: PolicyRequestInputsParams) {
  return (
    <Surrender currentStepOverride={0}>
      <IntroPage />
    </Surrender>
  );
}
