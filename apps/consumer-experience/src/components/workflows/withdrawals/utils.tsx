import { StepProps } from '@/components/stepped-workflow/types';

import { stepsInfo, WithdrawalSteps } from './steps';

type WithdrawalStepProps = StepProps<WithdrawalSteps>;

export const paymentUrl = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
  // TODO: annuities logic
}) => `/coverage/policies/${planCode}/${policyNumber}/withdrawal`;

export const returnToUrl = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
  // TODO: annuities logic
}) => `/coverage/policies/${planCode}/${policyNumber}`;

export const getNextUrl = ({
  step,
  planCode,
  policyNumber,
}: WithdrawalStepProps): string => {
  const allSteps = Object.keys(stepsInfo) as WithdrawalSteps[];
  const indexOfNext = allSteps.indexOf(step) + 1;
  const nextStepKey = allSteps[indexOfNext];

  if (!nextStepKey) {
    return returnToUrl({ planCode, policyNumber });
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
