import { StepProps, StepInfo } from '@/components/stepped-workflow/types';

const getNextUrl = <T extends StepInfo>({
  step,
  stepsInfo,
  returnUrl,
}: StepProps<T>): string => {
  const indexOfNext = stepsInfo.indexOf(step) + 1;
  const nextStep = stepsInfo[indexOfNext];

  if (!nextStep) {
    return returnUrl;
  }

  return nextStep.url;
};

const getPrevUrl = <T extends StepInfo>({
  step,
  stepsInfo,
  cancelUrl,
}: StepProps<T>): string => {
  const indexOfPrev = stepsInfo.indexOf(step) - 1;
  const prevStep = stepsInfo[indexOfPrev];

  if (!prevStep) {
    return cancelUrl;
  }

  return prevStep.url;
};

export const getStepInfo = <T extends StepInfo>(props: StepProps<T>) => {
  const { step, baseUrl } = props;
  const currentStep = step;

  return {
    title: currentStep.title,
    requiredData: currentStep.requiredData,
    stepUrl: `${baseUrl}/${step.url}`,
    nextStepUrl: getNextUrl(props),
    prevStepUrl: getPrevUrl(props),
  };
};
