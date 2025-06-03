import { HeaderLink } from '../header-link/HeaderLink';
import { ProgressBarSteps } from '../progress-bar-steps/ProgressBarSteps';

type FormHeaderProps = {
  totalSteps?: number;
  currentStep?: number;
  title?: string;
  link?: {
    url: string;
    label: string;
  };
};

export const FormHeader = ({
  currentStep,
  link,
  title,
  totalSteps,
}: FormHeaderProps) => {
  return (
    <>
      {currentStep !== undefined && totalSteps !== undefined && (
        <ProgressBarSteps
          totalSteps={totalSteps}
          currentStep={currentStep}
          className="steps-progress-bar mb-xl"
          description="Step"
        />
      )}
      {!!title?.length && <HeaderLink title={title} link={link} />}
    </>
  );
};
