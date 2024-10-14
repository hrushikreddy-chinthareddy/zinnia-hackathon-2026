import { Meta } from '@storybook/react';
import React from 'react';

import { Statuses } from '@deps/models/case/case';

import CaseOverviewStatus from './case-overview-status';

export default {
    title: 'Components/CaseOverviewStatus',
    component: CaseOverviewStatus,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof CaseOverviewStatus>;

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const today = new Date();

export const CaseOverviewStatusDefault = () => (
    <CaseOverviewStatus
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={today.toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusNotStarted = () => (
    <CaseOverviewStatus
        status={Statuses.NotStarted}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={today.toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusException = () => (
    <CaseOverviewStatus
        status={Statuses.Exception}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={today.toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusInProgress = () => (
    <CaseOverviewStatus
        status={Statuses.InProgress}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={today.toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusCompleted = () => (
    <CaseOverviewStatus
        status={Statuses.Completed}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={today.toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusNoTime = () => (
    <CaseOverviewStatus
        status={Statuses.Completed}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt=""
        createdAt={new Date().toISOString()}
    />
);

export const CaseOverviewStatusMinuteAgo = () => (
    <CaseOverviewStatus
        status={Statuses.Completed}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusMinutesAgo = () => (
    <CaseOverviewStatus
        status={Statuses.Completed}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 5).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusHourAgo = () => (
    <CaseOverviewStatus
        status={Statuses.Completed}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 60).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusHoursAgo = () => (
    <CaseOverviewStatus
        status={Statuses.Completed}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 60 * 5).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusDayAgo = () => (
    <CaseOverviewStatus
        status={Statuses.Completed}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const CaseOverviewStatusDaysAgo = () => (
    <CaseOverviewStatus
        status={Statuses.Completed}
        reason="Reason"
        detailedReason="Detailed reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);
