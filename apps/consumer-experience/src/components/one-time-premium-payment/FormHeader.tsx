import { getStepInfo, Steps, stepsOrder } from './steps';
import { HeaderLink } from '../header-link/HeaderLink';
import { ProgressBarSteps } from '../progress-bar-steps/ProgressBarSteps';

export const FormHeader = ({
  currentStep,
  policyNumber = '',
  planCode = '',
}: {
  currentStep: Steps;
  policyNumber?: string;
  planCode?: string;
}) => {
  const currentStepInfo = getStepInfo({
    step: currentStep,
    planCode,
    policyNumber,
  });
  return (
    <>
      <HeaderLink
        className="mb-xl"
        title={currentStepInfo?.title}
        link={{
          url: currentStepInfo?.prevStepUrl,
          // TODO: probably something better here
          label: `return to previous page`,
        }}
      />
      <ProgressBarSteps
        totalSteps={stepsOrder.length}
        currentStep={stepsOrder.findIndex(step => step === currentStep) + 1}
        className="steps-progress-bar mb-xl"
        description="Step"
      />
    </>
  );
};
