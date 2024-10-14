import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import ProgressBar from './progress-bar';

export default {
    title: 'Components/ProgressBar',
    component: ProgressBar,
    argTypes: {
        compareValue: {
            control: 'number',
        },
        total: {
            control: 'number',
        },
        label: {
            control: 'text',
        },
        labelTooltip: {
            control: 'text',
        },
    },
    decorators: [
        Story => (
            <div className="p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof ProgressBar>;

const tooltip = 'This is a tooltip';
const label = 'Guideline level premium limit';

export const UnderTotalProgressBar = (args: any) => (
    <ProgressBar total={22_000} compareValue={17_092} label={label} labelTooltip={tooltip} {...args} />
);

export const OverTotalProgressBar = (args: any) => (
    <ProgressBar total={22_000} compareValue={23_000} label={label} labelTooltip={tooltip} {...args} />
);
