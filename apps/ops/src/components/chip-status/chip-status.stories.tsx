import { Meta } from '@storybook/react';

import { Statuses } from '@deps/models/case/case';

import ChipStatus, { ChipStatusProps } from './chip-status';
import '@deps/styles/styles.css';

export default {
    title: 'Components/Chip/Status',
    component: ChipStatus,
    decorators: [
        (Story) => (
            <div className="h-screen w-screen p-10">
                <div
                    style={{
                        width: '90px',
                    }}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
    argTypes: {
        status: {
            control: 'text',
        },
    },
} as Meta<typeof ChipStatus>;

// ChipStatus for different statuses
export const New = (args: ChipStatusProps) => <ChipStatus {...args} />;
New.args = {
    status: Statuses.New,
};

export const InProgress = (args: ChipStatusProps) => <ChipStatus {...args} />;
InProgress.args = {
    status: Statuses.InProgress,
};

export const Exception = (args: ChipStatusProps) => <ChipStatus {...args} />;
Exception.args = {
    status: Statuses.Exception,
};

export const Completed = (args: ChipStatusProps) => <ChipStatus {...args} />;
Completed.args = {
    status: Statuses.Completed,
};

export const Canceled = (args: ChipStatusProps) => <ChipStatus {...args} />;
Canceled.args = {
    status: Statuses.Canceled,
};

export const NotStarted = (args: ChipStatusProps) => <ChipStatus {...args} />;
NotStarted.args = {
    status: Statuses.NotStarted,
};
