'use client';

import { useRouter } from 'next/navigation';

import { useOttp } from '@/components/providers/one-time-premium-payment/OttpContext';
import { OttpSteps } from '@/components/providers/one-time-premium-payment/types';
import { SteppedWorkflow } from '@/components/stepped-workflow/SteppedWorkflow';
import { useComponentVisibility } from '@/hooks/use-component-visibility';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { ComponentName } from '@/services/display-rules/types';

import { stepsInfo } from './steps';

interface OneTimePremiumProps {
  currentStepOverride: number;
  planCode: string;
  policyNumber: string;
  disableSubmission?: boolean;
  children?: React.ReactNode;
}

const OttpStages = stepsInfo;

export const OneTimePremium = ({
  currentStepOverride,
  children,
}: OneTimePremiumProps) => {
  const router = useRouter();
  const { lineOfBusinessUrl, planCode, policyNumber } = usePolicyUrlInputs();
  const { data } = useComponentVisibility(planCode, policyNumber);

  OttpStages[OttpSteps.SUBMITTED].actions = {
    primary: {
      // this will never be undefined
      text: OttpStages[OttpSteps.SUBMITTED].actions?.primary?.text || '',
      onClick: () => {
        router.push(
          `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}`
        );
      },
    },
    secondary: {
      // this will never be undefined
      text: OttpStages[OttpSteps.SUBMITTED].actions?.secondary?.text || '',
      onClick: () => {
        router.push(
          `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/premium/history`
        );
      },
    },
  };

  const cancelUrl = data?.[ComponentName.PREMIUM_PAYOR_BACK_URL]
    ? `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}`
    : `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/premium`;

  const baseTransactionUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/premium`;
  const { state } = useOttp();

  return (
    <SteppedWorkflow
      baseUrl={baseTransactionUrl}
      returnUrl={cancelUrl}
      cancelTitleText="Leave one-time payment transaction?"
      cancelBodyText="Are you sure you want to cancel this one-time payment transaction?"
      cancelUrl={cancelUrl}
      currentStepOverride={currentStepOverride}
      workflowSteps={Object.values(OttpStages)}
      currentState={state}
    >
      {children}
    </SteppedWorkflow>
  );
};
