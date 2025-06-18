import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { ZodObject } from 'zod';

import { BankDetail } from '@/components/person-data/types';

import { StepInfo } from './types';

export interface UserDetails {
  activeBanks: BankDetail[];
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
}

type SteppedWorkflowContextType = {
  // this is the URL to go back to if the user cancels the workflow
  cancelUrl: string;
  // this is the index of the active (visible) step in the workflow
  currentStepIndex: number;
  // this is a function to set the current step index
  setCurrentStepIndex: Dispatch<SetStateAction<number>>;
  // this is the list of steps in the workflow
  steps: StepInfo[];
  currentStep: StepInfo;
  stepInfo: {
    title: string;
    requiredData?: ZodObject<NonNullable<unknown>>;
    stepUrl: string;
    nextStepUrl: string;
    prevStepUrl: string;
  };
  primaryButtonDisabled: boolean;
  setPrimaryButtonDisabled: Dispatch<SetStateAction<boolean>>;
};

export const SteppedWorkflowContext = createContext<SteppedWorkflowContextType>(
  {} as SteppedWorkflowContextType
);

export const useSteppedWorkflowContext = () =>
  useContext(SteppedWorkflowContext);
