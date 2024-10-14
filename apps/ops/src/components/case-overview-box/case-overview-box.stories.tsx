import { Meta } from '@storybook/react';

import { Statuses } from '@deps/models/case/case';

import CaseOverViewBox, { CaseOverviewBoxProps } from './case-overview-box';
import '@deps/styles/styles.css';

export default {
    title: 'Containers/CaseOverviewBox',
    component: CaseOverViewBox,
    decorators: [
        Story => (
            <div className="h-screen w-screen p-10">
                <div
                    style={{
                        width: '931px',
                    }}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
    argTypes: {
        status: {
            control: 'select',
            options: Object.values(Statuses),
        },
    },
} as Meta<typeof CaseOverViewBox>;

export const InProgress = (args: CaseOverviewBoxProps) => <CaseOverViewBox {...args} />;
InProgress.args = {
    label: 'In Progress',
    stepProgress: {
        currentStep: 0,
        totalSteps: 6,
    },
    status: Statuses.InProgress,
};

export const Exception = (args: CaseOverviewBoxProps) => <CaseOverViewBox {...args} />;
Exception.args = {
    label: 'Exception',
    caseProgress: {
        open: 2,
        resolved: 4,
    },
    status: Statuses.Exception,
};

export const NotStarted = (args: CaseOverviewBoxProps) => <CaseOverViewBox {...args} />;
NotStarted.args = {
    label: 'Not Started',
    caseProgress: {
        open: 4,
        resolved: 1,
    },
    status: Statuses.NotStarted,
};

export const Completed = (args: CaseOverviewBoxProps) => <CaseOverViewBox {...args} />;
Completed.args = {
    label: 'Completed',
    status: Statuses.Completed,
};
