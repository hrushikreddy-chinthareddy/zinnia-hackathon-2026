import clsx from 'clsx';

import Content, { ContentVariant } from '@deps/components/content/content';
import { ProgressBarStepsTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as CheckmarkIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import styles from './progress-bar-steps-item.module.css';

export interface Step {
    component?: JSX.Element;
    index: number;
    isVisible?: () => boolean;
    isCompleted?: boolean;
    isDisabled?: boolean;
    screenReaderLabel: string;
    text: string;
    stepWidth?: number;
}

interface ProgressBarStepsItemProps extends Step {
    isActive?: boolean;
    onClick: () => void;
}

const ProgressBarStepsItem = ({
    onClick,
    text,
    index,
    isCompleted,
    isDisabled,
    isActive,
    screenReaderLabel = '',
    stepWidth,
}: ProgressBarStepsItemProps) => {
    const isCompletedAndNotDisabled = isCompleted && !isDisabled;
    const icon = isCompletedAndNotDisabled ? (
        <CheckmarkIcon
            className="mr-1 text-semantic-success"
            height={24}
            width={24}
        />
    ) : (
        `${index + 1}. `
    );

    return (
        <button
            onClick={onClick}
            className={clsx(
                styles.stepButton,
                isActive && styles.active,
                isDisabled && styles.disabled
            )}
            disabled={isDisabled}
            data-testid={ProgressBarStepsTest.StepsContainer}
            style={{ minWidth: `${stepWidth}px` }}
        >
            <div
                className={clsx(
                    styles.colorBar,
                    isActive && styles.active,
                    isDisabled && styles.disabled
                )}
            ></div>

            {isCompletedAndNotDisabled && icon}
            <Content
                details={`${!isCompletedAndNotDisabled ? icon : ''}${text}`}
                variant={ContentVariant.BodySm}
                className={styles.stepContent}
                data-testid={ProgressBarStepsTest.StepText}
            />
            <div className="sr-only">{screenReaderLabel}</div>
        </button>
    );
};

export default ProgressBarStepsItem;
