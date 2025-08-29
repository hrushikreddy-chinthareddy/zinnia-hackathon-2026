import { ButtonProps, Loader } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { RefAttributes, useEffect, useMemo, useState } from 'react';

import { CancelDialogLink } from './common/CancelDialogLink';
import { FormHeader } from './common/FormHeader';
import styles from './SteppedWorkflow.module.css';
import { useSteppedWorkflowContext } from './SteppedWorkflowContext';
import { SteppedWorkflowProvider } from './SteppedWorkflowProvider';
import { StepInfo } from './types';
import { Button } from '../button/Button';

export type SteppedWorkflowStep = {
  pageTitle: string;
  url?: string;
  children: React.ReactNode;
  cancelButtonText?: string;
  nextButtonText?: string;
  actions?: React.ReactNode;
  disableSubmission?: boolean;
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
  // TODO: eventually this should be required
  // but right now we don't have required data
  // on all transactionSteps, and this is only necessary
  // for validating against requiredData
  currentState?: any;
};

export const SteppedWorkflow = ({
  cancelTitleText,
  cancelBodyText,
  currentState,
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
        currentState={currentState}
      >
        {children}
      </WorkflowContainer>
    </SteppedWorkflowProvider>
  );
};

const WorkflowContainer = ({
  baseUrl,
  cancelTitleText,
  cancelBodyText,
  cancelUrl,
  currentState,
  workflowSteps,
  children,
}: SteppedWorkflowProps) => {
  const { stepInfo, currentStep, primaryButtonDisabled } =
    useSteppedWorkflowContext();
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();

  const totalSteps = workflowSteps.filter(({ order }) => order !== null).length;

  const isLastStep = useMemo(() => {
    const lastStep = workflowSteps[workflowSteps.length - 1];
    return currentStep.title === lastStep?.title;
  }, [currentStep.title, workflowSteps]);

  let nextButtonProps: ButtonProps & RefAttributes<HTMLButtonElement> = {
    children: currentStep?.actions?.primary?.text ?? 'Continue',
    disabled: primaryButtonDisabled,
  };

  useEffect(() => {
    // Don't validate the last step since it is technically outside of the form,
    // the data should be cleared on mount of that step so validation here
    // will always fail and cause a redirect, however we will still use
    // the requiredData property from the step to validate with local state
    // in the final step componenent. Could we clear the data on unmount
    // of the submitted component? Sure we could but react strict mode will still
    // screw ya if you try to validate because they mount/unmount/remount in dev
    // mode. Beleaf me.
    // TODO: this is not an ideal solution because it's not very intuitive
    // we should add some more generic workflow structure with steps
    // and actions that are required like all transactions should have a summary
    // and a submitted step. They should all have reset after form submission
    // https://zinnia.atlassian.net/browse/CUI-976
    // TODO: eventually all transactions need to be updated to pass in state,
    // but to avoid infinite rerenders excluding validation if currentState
    // is not passed in
    if (!currentStep?.requiredData || !currentState || isLastStep) {
      setIsValidating(false);
      return;
    }

    const validation = currentStep.requiredData?.safeParse(currentState);

    if (!validation.success) {
      const redirect = workflowSteps?.[0]?.url ?? baseUrl;
      router.push(redirect);
    } else {
      setIsValidating(false);
    }
  }, [
    baseUrl,
    currentState,
    currentStep,
    currentStep.requiredData,
    currentStep.title,
    isLastStep,
    router,
    workflowSteps,
  ]);

  if (isValidating) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '550px',
          justifyContent: 'center',
        }}
      >
        <Loader />
      </div>
    );
  }

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
          stepInfo.prevStepUrl && !isLastStep
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
          <Button
            onClick={currentStep.actions.secondary?.onClick}
            mode="link"
            size="small"
          >
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
