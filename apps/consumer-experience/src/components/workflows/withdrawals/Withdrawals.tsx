'use client';

import { useRouter } from 'next/navigation';

import { SteppedWorkflow } from '@/components/stepped-workflow/SteppedWorkflow';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';

import { stepsInfo, WithdrawalSteps } from './steps';

interface WithdrawalsProps {
  currentStepOverride: number;
  planCode: string;
  policyNumber: string;
  children?: React.ReactNode;
}

const WithdrawalStages = stepsInfo;

export const Withdrawals = ({
  currentStepOverride,
  children,
}: WithdrawalsProps) => {
  const router = useRouter();
  const { lineOfBusinessUrl, planCode, policyNumber } = usePolicyUrlInputs();

  WithdrawalStages[WithdrawalSteps.SUBMITTED].actions = {
    primary: {
      text: 'Back to contract overview',
      onClick: () => {
        router.push(`/coverage/policies/${planCode}/${policyNumber}`);
      },
    },
    secondary: null,
  };


  const cancelUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/withdrawal`;

  return (
    <SteppedWorkflow
      cancelTitleText="Leave this withdrawal?"
      cancelBodyText="Are you sure you want to cancel this withdrawal?"
      cancelUrl={cancelUrl}
      planCode={planCode}
      policyNumber={policyNumber}
      currentStepOverride={currentStepOverride}
      workflowSteps={Object.values(WithdrawalStages)}
    >
      {children}
    </SteppedWorkflow>
  );
};
