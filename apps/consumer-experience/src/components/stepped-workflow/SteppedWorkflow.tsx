import { Button, ButtonProps } from '@zinnia/bloom/components';
import { RefAttributes } from 'react';

import { CancelDialogLink } from './common/CancelDialogLink';
import { FormHeader } from './common/FormHeader';
import styles from './SteppedWorkflow.module.css';
import { useSteppedWorkflowContext } from './SteppedWorkflowContext';
import { SteppedWorkflowProvider } from './SteppedWorkflowProvider';
import { StepInfo } from './types';

export type SteppedWorkflowStep = {
  pageTitle: string;
  url?: string;
  children: React.ReactNode;
  cancelButtonText?: string;
  nextButtonText?: string;
  actions?: React.ReactNode;
};

export type SteppedWorkflowProps = {
  // this is the URL to go back to if the user cancels the workflow
  cancelUrl: string;
  cancelTitleText: string;
  cancelBodyText: string;
  workflowSteps: StepInfo[];
  currentStepOverride?: number;
  children?: React.ReactNode;
  baseUrl: string;
  returnUrl: string;
};

export const SteppedWorkflow = ({
  cancelTitleText,
  cancelBodyText,
  currentStepOverride,
  workflowSteps,
  children,
  cancelUrl = '#',
  baseUrl,
  returnUrl,
}: SteppedWorkflowProps) => {
  return (
    <SteppedWorkflowProvider
      cancelUrl={cancelUrl}
      baseUrl={baseUrl}
      returnUrl={returnUrl}
      workflowSteps={workflowSteps}
      cancelBodyText={cancelBodyText}
      cancelTitleText={cancelTitleText}
      steps={workflowSteps}
      initialStepIndex={currentStepOverride}
    >
      <WorkflowContainer
        baseUrl={baseUrl}
        returnUrl={returnUrl}
        cancelTitleText={cancelTitleText}
        cancelBodyText={cancelBodyText}
        cancelUrl={cancelUrl}
        workflowSteps={workflowSteps}
      >
        {children}
      </WorkflowContainer>
    </SteppedWorkflowProvider>
  );
};

const WorkflowContainer = ({
  cancelTitleText,
  cancelBodyText,
  cancelUrl,
  workflowSteps,
  children,
}: SteppedWorkflowProps) => {
  const { stepInfo, currentStep } = useSteppedWorkflowContext();

  const totalSteps = workflowSteps.filter(({ order }) => order !== null).length;

  let nextButtonProps: ButtonProps & RefAttributes<HTMLButtonElement> = {
    children: currentStep?.actions?.primary?.text ?? 'Continue',
  };

  if (currentStep) {
    if (currentStep?.actions?.primary?.onClick) {
      nextButtonProps = {
        ...nextButtonProps,
        onClick: currentStep.actions.primary.onClick,
      };
    } else {
      nextButtonProps = {
        ...nextButtonProps,
        type: 'submit',
        form: 'submit-form',
        className: styles.submit,
      };
    }
  }

  return (
    <div className={styles.container}>
      <FormHeader
        currentStep={currentStep?.order ?? undefined}
        totalSteps={totalSteps}
        title={currentStep?.title}
        link={
          stepInfo.prevStepUrl
            ? { url: stepInfo.prevStepUrl, label: 'Back' }
            : undefined
        }
      />
      <div className={styles.form}>{children}</div>
      <div className={styles.actions}>
        {currentStep && currentStep?.actions?.primary !== null && (
          <Button {...nextButtonProps} />
        )}
        {currentStep && currentStep?.actions?.secondary && (
          <Button onClick={currentStep.actions.secondary?.onClick}>
            {currentStep.actions.secondary?.text}
          </Button>
        )}
        {currentStep &&
          !currentStep?.actions?.secondary &&
          currentStep?.actions?.secondary !== null && (
            <CancelDialogLink
              cancelUrl={cancelUrl}
              titleText={cancelTitleText}
              bodyText={cancelBodyText}
            />
          )}
      </div>
    </div>
  );
};
