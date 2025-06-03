import { StepProps } from '@/components/stepped-workflow/types';

import { stepsInfo } from './steps';
import { WithdrawalSteps } from './types';

type WithdrawalStepProps = StepProps<WithdrawalSteps>;

export const paymentUrl = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
  // TODO: annuities logic
}) => `/coverage/policies/${planCode}/${policyNumber}/premium`;

export const getNextUrl = ({ step }: WithdrawalStepProps): string => {
  const allSteps = Object.keys(stepsInfo) as WithdrawalSteps[];
  const indexOfNext = allSteps.indexOf(step) + 1;
  let nextStepKey = allSteps[indexOfNext];
  if (!nextStepKey) {
    nextStepKey = allSteps[0] as WithdrawalSteps;
  }
  const nextStep = stepsInfo[nextStepKey];

  return nextStep.url;
};

export const getPrevUrl = ({ step }: WithdrawalStepProps): string => {
  const allSteps = Object.keys(stepsInfo) as WithdrawalSteps[];
  const currentIndex = allSteps.indexOf(step);
  const indexOfPrev = Math.max(currentIndex - 1, 0);
  let prevStepKey = allSteps[indexOfPrev];
  if (!prevStepKey) {
    prevStepKey = allSteps[0] as WithdrawalSteps;
  }
  const prevStep = stepsInfo[prevStepKey];
  return prevStep.url;
};

export const getStepInfo = ({
  step,
  planCode,
  policyNumber,
}: WithdrawalStepProps) => {
  return {
    title: stepsInfo[step].title,
    requiredData: stepsInfo[step].requiredData,
    stepUrl: `${paymentUrl({
      planCode,
      policyNumber,
    })}/${step}`,
    nextStepUrl: getNextUrl({ step, planCode, policyNumber }),
    prevStepUrl: getPrevUrl({ step, planCode, policyNumber }),
  };
};
