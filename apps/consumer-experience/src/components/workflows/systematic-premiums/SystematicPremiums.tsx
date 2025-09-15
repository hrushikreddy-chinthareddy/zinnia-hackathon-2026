'use client';

import { useRouter } from 'next/navigation';

import { SystematicPremiumSteps } from '@/components/providers/systematic-premiums/types';
import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { SteppedWorkflow } from '@/components/stepped-workflow/SteppedWorkflow';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';

import { stepsInfo } from './steps';

interface SystematicPremiumsProps {
  currentStepOverride: number;
  children?: React.ReactNode;
}

const SystematicPremiumStages = stepsInfo;

export const SystematicPremiums = ({
  currentStepOverride,
  children,
}: SystematicPremiumsProps) => {
  const router = useRouter();
  const { state } = useSystematicPremiums();
  const { lineOfBusinessUrl, planCode, policyNumber } = usePolicyUrlInputs();

  SystematicPremiumStages[SystematicPremiumSteps.SUBMITTED].actions = {
    primary: {
      text: 'Back to contract overview',
      onClick: () => {
        router.push(
          `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}`
        );
      },
    },
    secondary: null,
  };

  const cancelUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/premium`;
  const baseTransactionUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/systematic-premium`;

  if (state.currentSystematicPremium) {
    SystematicPremiumStages[SystematicPremiumSteps.AMOUNT].title =
      'Manage Premium Autopay';
  }

  return (
    <SteppedWorkflow
      baseUrl={baseTransactionUrl}
      returnUrl={cancelUrl}
      cancelTitleText="Leave premium autopay transaction?"
      cancelBodyText="Are you sure you want to cancel this premium autopay transaction?"
      cancelUrl={cancelUrl}
      currentStepOverride={currentStepOverride}
      workflowSteps={Object.values(SystematicPremiumStages)}
    >
      {children}
    </SteppedWorkflow>
  );
};
