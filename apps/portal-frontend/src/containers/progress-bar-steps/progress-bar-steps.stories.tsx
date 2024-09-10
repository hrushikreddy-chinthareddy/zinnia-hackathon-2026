import { Meta } from '@storybook/react';
import { useState } from 'react';

import ProgressBarSteps from './progress-bar-steps';
import { Step } from './progress-bar-steps-item/progress-bar-steps-item';

export default {
    title: 'Containers/ProgressBarSteps',
    component: ProgressBarSteps,
    decorators: [
        Story => (
            <div className="max-w-[1130px]">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof ProgressBarSteps>;

export const ProgressBarStepsDefault = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;
        setCurrentStepIndex(step.index);
    };

    const props = {
        currentStepIndex: currentStepIndex,
        onClick: handleClick,
        steps: [
            { text: 'Step 1', index: 0, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 2', index: 1, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 3', index: 2, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
        ],
    };

    return <ProgressBarSteps {...props} />;
};

export const ProgressBarStepsFull = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(4);
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;
        setCurrentStepIndex(step.index);
    };

    const props = {
        currentStepIndex: currentStepIndex,
        onClick: handleClick,
        steps: [
            { text: 'Step 1', index: 0, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 2', index: 1, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 3', index: 2, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 4', index: 3, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 5', index: 4, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 6', index: 5, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 7', index: 6, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
            { text: 'Step 8', index: 7, ariaLabel: 'ariaLabel', screenReaderLabel: 'screenReaderLabel' },
        ],
    };

    return <ProgressBarSteps {...props} />;
};
