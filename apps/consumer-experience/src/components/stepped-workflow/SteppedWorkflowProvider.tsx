'use client';

import { useRouter } from 'next/navigation';
import { useState, PropsWithChildren, useEffect } from 'react';

import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';

import { SteppedWorkflowContext } from './SteppedWorkflowContext';
import { StepInfo } from './types';
import { getStepInfo } from './utils';

interface SteppedWorkflowProviderProps extends PropsWithChildren {
  // base url for the workflow
  baseUrl: string;
  // index of the step to start on
  initialStepIndex?: number;
  // this is the URL to go back to if the user cancels the workflow
  cancelUrl: string;
  // text for the cancel modal title
  cancelTitleText: string;
  // text for the cancel modal body
  cancelBodyText: string;
  // all steps in the workflow
  workflowSteps: StepInfo[];
  // override the current step
  currentStepOverride?: number;
  // form
  children?: React.ReactNode;
  // URL to go back to after a successful workflow
  returnUrl: string;
  // step: StepInfo;
  steps: StepInfo[];
}

export const SteppedWorkflowProvider = ({
  children,
  initialStepIndex = 0,
  steps,
  cancelUrl,
  baseUrl,
  workflowSteps,
  returnUrl,
}: SteppedWorkflowProviderProps) => {
  const router = useRouter();
  const { planCode, policyNumber } = usePolicyUrlInputs();
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [primaryButtonDisabled, setPrimaryButtonDisabled] = useState(false);
  let activeStep = steps[currentStepIndex];

  if (!activeStep) {
    activeStep = steps[0] as StepInfo;
  }

  const stepInfo = getStepInfo({
    baseUrl,
    step: activeStep as StepInfo,
    planCode,
    policyNumber,
    stepsInfo: workflowSteps,
    cancelUrl,
    returnUrl,
  });

  useEffect(() => {
    // prefetch next step
    router.prefetch(stepInfo.nextStepUrl);
  }, [router, stepInfo.nextStepUrl]);

  return (
    <SteppedWorkflowContext.Provider
      value={{
        cancelUrl,
        currentStepIndex,
        setCurrentStepIndex,
        steps,
        currentStep: activeStep,
        stepInfo,
        setPrimaryButtonDisabled,
        primaryButtonDisabled,
      }}
    >
      {children}
    </SteppedWorkflowContext.Provider>
  );
};
