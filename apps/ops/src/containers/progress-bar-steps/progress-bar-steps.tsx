import { useWindowResize } from '@xd/hooks/useWindowResize';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

import ProgressBarStepsItem, { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { scrollToElement } from '@deps/helpers/routing.helpers';
import { DEFAULT_STEP_WIDTH, SCREEN_BREAKPOINTS } from '@deps/types/constants';

import styles from './progress-bar-steps.module.css';

interface ProgressBarStepsProps {
    steps: Step[];
    currentStepIndex: number;
    onClick: (step: Step) => void;
    classNames?: string;
    // this is fixed width from Figma of each step
    stepWidth?: number;
}

const ProgressBarSteps = ({ steps, currentStepIndex, onClick, classNames, stepWidth = DEFAULT_STEP_WIDTH }: ProgressBarStepsProps) => {
    const { t } = useTranslation();

    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const MARGIN = 64;
    const [isScrollable, setIsScrollable] = useState(false);
    const windowWidth = useWindowResize();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (steps.length > 0) {
            const stepsWidth = steps.length * stepWidth;
            setIsScrollable(stepsWidth + MARGIN > SCREEN_BREAKPOINTS.page || stepsWidth > windowWidth);
        }
    }, [stepWidth, steps, windowWidth]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isMounted && isScrollable) {
            timeoutId = setTimeout(() => {
                scrollToElement(containerRef, currentStepIndex);
            }, 100);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [currentStepIndex, isMounted, isScrollable]);

    // Need to check the width of the steps to determine if we need to add a scrollbar
    // This is because the scrollbar obscures the box shadow and border radius on the entire container

    return (
        <div className={clsx(isScrollable && styles.progressBar__scrollable)} ref={containerRef}>
            <div
                className={clsx(styles.progressBar__steps, classNames)}
                style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(${stepWidth}px, 1fr))` }}
            >
                {steps.map((step, index) => {
                    const isActive = step.index === currentStepIndex;
                    const isDisabled = step.isDisabled || step.index > currentStepIndex;
                    const isCompleted = step.isCompleted || step.index < currentStepIndex;

                    return (
                        <ProgressBarStepsItem
                            {...step}
                            key={`${step.text}-${index}`}
                            isActive={isActive}
                            isDisabled={isDisabled}
                            isCompleted={isCompleted}
                            screenReaderLabel={t('progressBarSteps.stepCount', { step: index + 1, endStep: steps.length })}
                            onClick={() => onClick(step)}
                            stepWidth={stepWidth}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBarSteps;
