import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

import styles from './ProgressBar.module.css';

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

  // The final two conditions are if it's the current step
  if (isFinalStep) {
    return (
      <div className={styles.step} aria-hidden role="presentation">
        <span className="typography-labels-field-label">
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

  const isFinalStepCurrent =
    totalSteps + 1 === currentStep && totalSteps === currentStep;
  console.log('totalSteps', totalSteps);
  console.log('currentStep', 100 / totalSteps - 1);
  return (
    <div
      className={clsx(styles.container, { [className as string]: className })}
    >
      {[...Array(totalSteps - 1)].map((_, index) => {
        const currentNumber = index + 1;
        const isCurrent = currentNumber === currentStep;
        const isComplete = currentNumber < currentStep;
        // const isFinalStep = isCurrent && totalSteps === currentStep;

        return (
          <div
            key={index}
            style={{
              width: `${100 / (totalSteps - 1)}%`,
              color: `${isComplete ? 'var(--color-base-border-border-primary-color)' : 'var(--color-base-surface-surface-bold)'}`,
            }}
            className={styles.stepContainer}
          >
            <ProgressStep
              number={currentNumber}
              isComplete={isCurrent ? null : isComplete}
            />
            {/* <div
              style={{
                height: '2px',
                width: '100%',
                backgroundColor: '#b3b3b3',
              }}
            ></div> */}
            <span className="sr-only">{`${isCurrent ? 'currently on' : ''} step ${currentNumber} of ${totalSteps} ${isComplete ? 'is complete' : ''}`}</span>
          </div>
        );
      })}
      <ProgressStep
        isComplete={
          totalSteps === currentStep ? null : totalSteps < currentStep
        }
        isFinalStep={true}
      />
      {isFinalStepCurrent && (
        <span className="sr-only">all steps complete</span>
      )}
    </div>
  );
};

// if currentNumber > current step
