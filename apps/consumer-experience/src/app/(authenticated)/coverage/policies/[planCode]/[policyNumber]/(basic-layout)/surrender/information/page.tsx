import { IntroPage } from '@/components/stepped-workflow/workflows/surrender/forms/IntroPage';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';

export default async function ConfirmPage() {
  return (
    <Surrender currentStepOverride={0}>
      <IntroPage />
    </Surrender>
  );
}
