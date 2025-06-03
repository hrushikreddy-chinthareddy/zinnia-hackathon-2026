import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { Button, ButtonProps } from '@zinnia/bloom/components';
import { useParams } from 'next/navigation';
import { RefAttributes } from 'react';

import { CancelDialogLink } from './CancelDialogLink';
import { FormHeader } from './FormHeader';
import styles from './SteppedWorkflow.module.css';
import { useSteppedWorkflowContext } from './SteppedWorkflowContext';
import { SteppedWorkflowProvider } from './SteppedWorkflowProvider';
import { StepInfo } from './types';
import { stepsInfo } from '../workflows/withdrawals/steps';
import { WithdrawalSteps } from '../workflows/withdrawals/types';
import { getPrevUrl } from '../workflows/withdrawals/utils';

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
  planCode: string;
  policyNumber: string;
  currentStepOverride?: number;
  children?: React.ReactNode;
  lineOfBusiness?: LineOfBusiness;
};

export const SteppedWorkflow = ({
  cancelTitleText,
  cancelBodyText,
  currentStepOverride,
  planCode,
  policyNumber,
  workflowSteps,
  children,
  cancelUrl = '#',
}: SteppedWorkflowProps) => {
  return (
    <SteppedWorkflowProvider
      steps={workflowSteps}
      initialStepIndex={currentStepOverride}
    >
      <WorkflowContainer
        cancelTitleText={cancelTitleText}
        cancelBodyText={cancelBodyText}
        cancelUrl={cancelUrl}
        planCode={planCode}
        policyNumber={policyNumber}
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
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const { currentStepIndex } = useSteppedWorkflowContext();

  const totalSteps = workflowSteps.filter(({ order }) => order !== null).length;

  const activeStep = workflowSteps[currentStepIndex];

  let nextButtonProps: ButtonProps & RefAttributes<HTMLButtonElement> = {
    children: activeStep?.actions?.primary?.text ?? 'Continue',
  };

  let prevUrl;
  if (currentStepIndex > 0 && !!workflowSteps[currentStepIndex]) {
    const currentStep = Object.keys(stepsInfo)[
      currentStepIndex
    ] as WithdrawalSteps;

    prevUrl = getPrevUrl({
      step: currentStep,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    });
  }

  if (activeStep?.actions?.primary?.onClick) {
    nextButtonProps = {
      ...nextButtonProps,
      onClick: activeStep.actions.primary.onClick,
    };
  } else {
    nextButtonProps = {
      ...nextButtonProps,
      type: 'submit',
      form: 'submit-form',
      className: styles.submit,
    };
  }
  return (
    <div className={styles.container}>
      <FormHeader
        currentStep={activeStep?.order ?? undefined}
        totalSteps={totalSteps}
        title={activeStep?.title}
        link={prevUrl ? { url: prevUrl, label: 'Back' } : undefined}
      />
      <div className={styles.form}>{children}</div>
      <div className={styles.actions}>
        {activeStep?.actions?.primary !== null && (
          <Button {...nextButtonProps} />
        )}
        {activeStep?.actions?.secondary && (
          <Button onClick={activeStep.actions.secondary?.onClick}>
            {activeStep.actions.secondary?.text}
          </Button>
        )}
        {!activeStep?.actions?.secondary &&
          activeStep?.actions?.secondary !== null && (
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
