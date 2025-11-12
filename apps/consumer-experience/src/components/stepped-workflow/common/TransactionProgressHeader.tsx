'use client';
import { useGetTransactionStepData } from '@/hooks/use-get-transaction-step-data';

import { HeaderLink } from '../../header-link/HeaderLink';
import { ProgressBarSteps } from '../../progress-bar-steps/ProgressBarSteps';
import { StepInfo } from '../types';

export const TransactionProgressHeader = ({
  stepsInfo,
  baseUrl,
}: {
  stepsInfo: Record<string, StepInfo>;
  baseUrl: string;
}) => {
  const { currentStep, progressSteps, previousStep } =
    useGetTransactionStepData({
      stepsInfo,
    });

  const currentProgressStepIndex = progressSteps?.findIndex(
    step => step.url === currentStep?.url
  );

  const title = currentStep?.title;
  const link = previousStep?.url || baseUrl;

  return (
    <div className="mb-xl">
      {currentProgressStepIndex != undefined && progressSteps != undefined && (
        <ProgressBarSteps
          totalSteps={progressSteps?.length}
          // TODO: add this 1 elswehere?
          currentStep={currentProgressStepIndex + 1}
          className="steps-progress-bar mb-xl"
          description="Step"
        />
      )}
      {!!title?.length && (
        <HeaderLink
          title={title}
          link={{ url: link || '', label: title || 'return to overview page' }}
        />
      )}
    </div>
  );
};
