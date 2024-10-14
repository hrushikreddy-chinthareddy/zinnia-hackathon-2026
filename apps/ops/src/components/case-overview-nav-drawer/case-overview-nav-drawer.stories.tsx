import { Meta } from '@storybook/react';

import { Statuses } from '@deps/models/case/case';

import CaseOverviewNavDrawer, { CaseOverviewNavDrawerProps } from './case-overview-nav-drawer';
import '@deps/styles/styles.css';

export default {
    title: 'Components/CaseOverviewNavDrawer',
    component: CaseOverviewNavDrawer,
    decorators: [
        Story => (
            <div className="h-screen w-screen p-10">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        status: {
            control: 'text',
        },
    },
} as Meta<typeof CaseOverviewNavDrawer>;

// ChipStatus for different statuses
export const Default = (args: CaseOverviewNavDrawerProps) => <CaseOverviewNavDrawer {...args} />;
Default.args = {
    caseStatus: Statuses.InProgress,
    stages: [
        {
            label: 'Request Initiated',
            stageStatus: Statuses.Completed,
        },
        {
            label: 'Agent Validation',
            stageStatus: Statuses.Completed,
        },
        {
            label: 'Policy Validation',
            stageStatus: Statuses.InProgress,
        },
        {
            label: 'Pre Notification Letter',
            stageStatus: Statuses.InProgress,
        },
        {
            label: 'Premium Processing',
            stageStatus: Statuses.InProgress,
        },
        {
            label: 'Policy Generation',
            stageStatus: Statuses.NotStarted,
        },
    ],
};
