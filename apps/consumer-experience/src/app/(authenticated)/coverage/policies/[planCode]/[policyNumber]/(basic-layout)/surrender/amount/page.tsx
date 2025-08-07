import { Date } from '@/components/workflows/surrender/forms/Date';
import Surrender from '@/components/workflows/surrender/Surrender';
import { PolicyRequestInputsParams } from '@/types/policy';

export default async function ConfirmPage({
  params,
}: PolicyRequestInputsParams) {
  return (
    <Surrender currentStepOverride={1}>
      <Date />
    </Surrender>
  );
}
