import { Meta } from '@storybook/react';
import React from 'react';

import { Statuses } from '@deps/models/case/case';

import StepStatus from './step-status';

export default {
    title: 'Components/StepStatus',
    component: StepStatus,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof StepStatus>;

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(15);
const today = new Date();
today.setHours(2);

export const StepStatusDefault = () => <StepStatus label="Reason" updatedAt={today.toISOString()} createdAt={yesterday.toISOString()} />;

export const StepStatusNotStarted = () => (
    <StepStatus status={Statuses.NotStarted} label="Reason" updatedAt={today.toISOString()} createdAt={yesterday.toISOString()} />
);

export const StepStatusException = () => (
    <StepStatus status={Statuses.Exception} label="Reason" updatedAt={today.toISOString()} createdAt={yesterday.toISOString()} />
);

export const StepStatusInProgress = () => (
    <StepStatus status={Statuses.InProgress} label="Reason" updatedAt={today.toISOString()} createdAt={yesterday.toISOString()} />
);

export const StepStatusCompleted = () => (
    <StepStatus status={Statuses.Completed} label="Reason" updatedAt={today.toISOString()} createdAt={yesterday.toISOString()} />
);

export const StepStatusNoTime = () => (
    <StepStatus status={Statuses.Completed} label="Reason" updatedAt="" createdAt={new Date().toISOString()} />
);

export const StepStatusMinuteAgo = () => (
    <StepStatus
        status={Statuses.Completed}
        label="Reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const StepStatusMinutesAgo = () => (
    <StepStatus
        status={Statuses.Completed}
        label="Reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 5).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const StepStatusHourAgo = () => (
    <StepStatus
        status={Statuses.Completed}
        label="Reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 60).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const StepStatusHoursAgo = () => (
    <StepStatus
        status={Statuses.Completed}
        label="Reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 60 * 5).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const StepStatusDayAgo = () => (
    <StepStatus
        status={Statuses.Completed}
        label="Reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);

export const StepStatusDaysAgo = () => (
    <StepStatus
        status={Statuses.Completed}
        label="Reason"
        updatedAt={new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5).toISOString()}
        createdAt={yesterday.toISOString()}
    />
);
