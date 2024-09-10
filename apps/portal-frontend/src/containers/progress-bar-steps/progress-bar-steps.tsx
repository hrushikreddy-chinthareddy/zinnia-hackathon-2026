import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

import ProgressBarStepsItem, { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { scrollToElement } from '@deps/helpers/routing.helper';
import { useWindowResize } from '@deps/hooks/useWindowResize';
import { SCREEN_BREAKPOINTS } from '@deps/types/constants';

interface ProgressBarStepsProps {
    steps: Step[];
    currentStepIndex: number;
    onClick: (step: Step) => void;
    classNames?: string;
}

const ProgressBarSteps = ({ steps, currentStepIndex, onClick, classNames }: ProgressBarStepsProps) => {
    const { t } = useTranslation();

    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const STEP_WIDTH = 188; // this is fixed width from Figma of each step
    const MARGIN = 64;
    const [isScrollable, setIsScrollable] = useState(false);
    const windowWidth = useWindowResize();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (steps.length > 0) {
            const stepsWidth = steps.length * STEP_WIDTH;
            setIsScrollable(stepsWidth + MARGIN > SCREEN_BREAKPOINTS.page || stepsWidth > windowWidth);
        }
    }, [steps, windowWidth]);

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
    const scrollbarClasses = clsx({
        'w-full overflow-x-auto scroll-smooth pb-2': isScrollable,
    });

    return (
        <div className={clsx('flex-shrink-0', scrollbarClasses)} ref={containerRef}>
            <div
                className={clsx(
                    'grid min-w-[940px] max-w-[1130px] gap-0.5 rounded shadow-elevation-light-04 sm:overflow-hidden md:overflow-auto',
                    classNames
                )}
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
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBarSteps;
