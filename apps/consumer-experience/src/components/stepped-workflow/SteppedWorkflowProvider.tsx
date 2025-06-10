'use client';

import { useState, PropsWithChildren } from 'react';

import { SteppedWorkflowContext } from './SteppedWorkflowContext';
import { StepInfo } from './types';

interface SteppedWorkflowProviderProps extends PropsWithChildren {
  initialStepIndex?: number;
  steps: StepInfo[];
}

export const SteppedWorkflowProvider = ({
  children,
  initialStepIndex = 0,
  steps,
}: SteppedWorkflowProviderProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [primaryButtonDisabled, setPrimaryButtonDisabled] = useState(false);

  return (
    <SteppedWorkflowContext.Provider
      value={{
        currentStepIndex,
        setCurrentStepIndex,
        steps,
        setPrimaryButtonDisabled,
        primaryButtonDisabled,
      }}
    >
      {children}
    </SteppedWorkflowContext.Provider>
  );
};
