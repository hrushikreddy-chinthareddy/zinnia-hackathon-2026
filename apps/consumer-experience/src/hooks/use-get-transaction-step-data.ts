import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { StepInfo } from '@/components/stepped-workflow/types';

export const useGetTransactionStepData = ({
  stepsInfo,
}: {
  stepsInfo: Record<string, StepInfo>;
}) => {
  const [currentStep, setCurrentStep] = useState<StepInfo | null>(null);
  const [nextStep, setNextStep] = useState<StepInfo | null>(null);
  const [previousStep, setPreviousStep] = useState<StepInfo | null>(null);
  const [progressSteps, setProgressSteps] = useState<StepInfo[]>([]);
  const pathName = usePathname();

  useEffect(() => {
    const currentRoute = pathName.split('/')[pathName.split('/').length - 1];
    const currentStepIndex = Object.values(stepsInfo).findIndex(
      step => step.url === currentRoute
    );
    const progressSteps = Object.values(stepsInfo).filter(
      step => !step.excludeFromProgress
    );

    setProgressSteps(progressSteps);
    setCurrentStep(Object.values(stepsInfo)[currentStepIndex] ?? null);
    setNextStep(Object.values(stepsInfo)[currentStepIndex + 1] ?? null);
    setPreviousStep(Object.values(stepsInfo)[currentStepIndex - 1] ?? null);
  }, [pathName, stepsInfo]);

  return {
    currentStep,
    nextStep,
    progressSteps,
    previousStep,
  };
};
