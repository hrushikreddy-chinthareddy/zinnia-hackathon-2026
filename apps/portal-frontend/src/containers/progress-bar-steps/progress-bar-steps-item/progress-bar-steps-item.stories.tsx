import { Meta } from '@storybook/react';

import ProgressBarStepsItem from './progress-bar-steps-item';

export default {
    title: 'Containers/ProgressBarSteps/ProgressBarStepsItem',
    component: ProgressBarStepsItem,
    argTypes: {
        isCompleted: { control: 'boolean' },
        isDisabled: { control: 'boolean' },
        text: { control: 'text' },
        step: { control: 'number' },
        clickContainerAriaLabel: { control: 'text' },
        onClick: { action: 'clicked' },
    },
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof ProgressBarStepsItem>;

export const ProgressBarStepsItemDefault = (args: any) => {
    const props = {
        isCompleted: false,
        isDisabled: false,
        text: 'Step 1',
        step: 1,
        clickContainerAriaLabel: 'Step 1',
    };

    return (
        <div>
            <ProgressBarStepsItem {...props} {...args} />
        </div>
    );
};

export const ProgressBarStepsItemCompleted = (args: any) => {
    const props = {
        isCompleted: true,
        isDisabled: false,
        text: 'Step 1',
        index: 0,
        clickContainerAriaLabel: 'Step 1',
    };

    return (
        <div>
            <ProgressBarStepsItem {...props} {...args} />
        </div>
    );
};

export const ProgressBarStepsItemDisabled = (args: any) => {
    const props = {
        isCompleted: false,
        isDisabled: true,
        text: 'Step 1',
        index: 0,
        clickContainerAriaLabel: 'Step 1',
    };

    return (
        <div>
            <ProgressBarStepsItem {...props} {...args} />
        </div>
    );
};
