'use client';

import { useRouter } from 'next/navigation';

import { SteppedWorkflow } from '@/components/stepped-workflow/SteppedWorkflow';
import { SurrenderSteps } from '@/components/stepped-workflow/workflows/surrender/provider/types';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { LineOfBusiness } from '@zinnia/api-types/types/bpm';

import { stepsInfo } from './steps';

interface SurrenderProps {
  currentStepOverride: number;
  children?: React.ReactNode;
}
const SurrenderStages = stepsInfo;

export default function Surrender({
  currentStepOverride,
  children,
}: SurrenderProps) {
  const router = useRouter();
  const { lineOfBusinessUrl, planCode, policyNumber } = usePolicyUrlInputs();

  const submitBtnText =
    lineOfBusinessUrl === LineOfBusiness.ANNUITY
      ? 'Back to contract overview'
      : 'Back to policy overview';

  SurrenderStages[SurrenderSteps.SUBMITTED].actions = {
    primary: {
      text: submitBtnText,
      onClick: () => {
        router.push(
          `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}`
        );
      },
    },
    secondary: null,
  };

  const cancelUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/account/surrender`;
  const baseUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/account/surrender`;
  const returnUrl = cancelUrl;

  return (
    <SteppedWorkflow
      returnUrl={returnUrl}
      baseUrl={baseUrl}
      cancelTitleText="Leave this surrender?"
      cancelBodyText="Are you sure you want to cancel surrendering your policy?"
      cancelUrl={cancelUrl}
      currentStepOverride={currentStepOverride}
      workflowSteps={Object.values(SurrenderStages)}
    >
      {children}
    </SteppedWorkflow>
  );
}
