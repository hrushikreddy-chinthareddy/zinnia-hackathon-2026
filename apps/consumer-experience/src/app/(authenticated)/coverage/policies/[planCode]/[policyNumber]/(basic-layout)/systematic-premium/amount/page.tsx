import { SystematicPremiumAmountStep } from '@/components/workflows/systematic-premiums/forms/SystematicPremiumAmountStep';
import { SystematicPremiumAmountStepTerm } from '@/components/workflows/systematic-premiums/forms/SystematicPremiumAmountStepTerm';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';
import { getComponentVisibility } from '@/services/display-rules';
import { ComponentName } from '@/services/display-rules/types';
import { PolicyRequestInputs } from '@/types/policy';

export default async function AmountPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const visibility = await getComponentVisibility(policyNumber, planCode);

  return (
    <SystematicPremiums currentStepOverride={0}>
      {visibility?.[
        ComponentName.SYSTEMATIC_PREMIUM_AUTOPAY_WITH_QUOTE_VALUES
      ]() ? (
        <SystematicPremiumAmountStepTerm />
      ) : (
        <SystematicPremiumAmountStep />
      )}
    </SystematicPremiums>
  );
}
