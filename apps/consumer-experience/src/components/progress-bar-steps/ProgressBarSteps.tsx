import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

import styles from './ProgressBar.module.css';

export interface ProgressBarStepsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  totalSteps: number;
  currentStep: number;
}

interface ProgressStepProps extends React.HTMLAttributes<HTMLDivElement> {
  number?: number;
  isComplete?: boolean | null;
  isFinalStep?: boolean;
}

const ProgressStep = ({
  number,
  isComplete,
  isFinalStep,
}: ProgressStepProps) => {
  if (isComplete === false) {
    return <div className={styles.stepIncomplete} aria-hidden />;
  }

  if (isComplete) {
    return (
      <div className={styles.step} aria-hidden>
        <span className="typography-labels-field-label">
          <Icon type={IconType.CHECKMARK} width={12} height={12} />
        </span>
      </div>
    );
  }

  if (isFinalStep) {
    return (
      <div className={styles.step} aria-hidden>
        <span className="typography-labels-field-label">
          {/* TODO: change icon once flag is merged into bloom */}
          <Icon type={IconType.CASH} width={12} height={12} />
        </span>
      </div>
    );
  }

  return (
    <div className={styles.step} aria-hidden>
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

  return (
    <div className={clsx(styles.container, { className: className })}>
      {[...Array(totalSteps)].map((_, index) => {
        const currentNumber = index + 1;
        const isCurrent = currentNumber === currentStep;
        const isComplete = currentNumber < currentStep;
        const isFinalStep = isCurrent && totalSteps === currentStep;

        return (
          <>
            <ProgressStep
              key={index}
              number={currentNumber}
              isComplete={isCurrent ? null : isComplete}
              isFinalStep={isFinalStep}
            />
            <span className="sr-only">{`step ${currentNumber} of ${totalSteps} ${isComplete ? 'is complete' : ''}`}</span>
            <span className="sr-only">
              {isFinalStep ? 'all steps complete' : ''}
            </span>
          </>
        );
      })}
    </div>
  );
};
