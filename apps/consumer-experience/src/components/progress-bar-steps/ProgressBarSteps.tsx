import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

import styles from './ProgressBar.module.css';
import { displayAsCurrent } from './utils';

export interface ProgressBarStepsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  totalSteps: number;
  currentStep: number;
}

export interface ProgressStepProps
  extends React.HTMLAttributes<HTMLDivElement> {
  number?: number;
  isComplete?: boolean | null;
  isFinalStep?: boolean;
}

export const ProgressStep = ({
  number,
  isComplete,
  isFinalStep,
}: ProgressStepProps) => {
  if (isComplete === false) {
    return (
      <div className={styles.stepIncomplete} aria-hidden role="presentation" />
    );
  }

  if (isComplete) {
    return (
      <div className={styles.step} aria-hidden role="presentation">
        <span className="typography-labels-field-label">
          <Icon type={IconType.CHECKMARK} width={12} height={12} />
        </span>
      </div>
    );
  }

  // These final two conditions are if it's the current step
  if (isFinalStep) {
    return (
      <div className={styles.step} aria-hidden role="presentation">
        <span
          className="typography-labels-field-label"
          data-testid="final-step"
        >
          <Icon type={IconType.FLAG} width={12} height={12} />
        </span>
      </div>
    );
  }

  return (
    <div className={styles.step} aria-hidden role="presentation">
      <span className="typography-labels-field-label">{number}</span>
    </div>
  );
};

export const ProgressBarSteps = ({
  className,
  totalSteps,
  currentStep,
}: ProgressBarStepsProps) => {
  if (!totalSteps) {
    return null;
  }

  const stepsWithoutFinal = totalSteps - 1;
  const isFinalStepCurrent = displayAsCurrent(currentStep, totalSteps);

  return (
    <div className={clsx(styles.container, className)}>
      {Array.from({ length: stepsWithoutFinal }, (_, index) => {
        const currentStepIndex = index + 1;
        const isCurrent = displayAsCurrent(currentStep, currentStepIndex);
        const isStepComplete = currentStepIndex < currentStep;

        return (
          <div
            key={index}
            style={{
              width: `${100 / stepsWithoutFinal}%`,
              color: isStepComplete
                ? 'var(--color-base-border-border-primary-color)'
                : 'var(--color-base-surface-surface-bold)',
            }}
            className={styles.stepContainer}
          >
            <ProgressStep
              number={currentStepIndex}
              isComplete={isCurrent ? null : isStepComplete}
              isFinalStep={false}
            />
            <span className="sr-only">
              {`${isCurrent ? 'currently on' : ''} step ${currentStepIndex} of ${totalSteps} ${
                isStepComplete ? 'is complete' : ''
              }`}
            </span>
          </div>
        );
      })}
      <ProgressStep
        isComplete={isFinalStepCurrent ? null : totalSteps < currentStep}
        isFinalStep={true}
      />
      {isFinalStepCurrent && (
        <span className="sr-only">All steps complete</span>
      )}
    </div>
  );
};
