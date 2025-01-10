import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { getSlug, toTitleCase } from '@deps/helpers/string.helper';
import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';

import { Task } from './task-listing.types';

export const buildTaskLink = (taskId: string, caseId: string, caseType: string, documentNumber: string, clientId: string) => {
    const caseSlug = getSlug(caseType);
    const link = `/create-case/${caseSlug}/${caseId}?taskId=${taskId}&doc=${documentNumber}&clientId=${clientId}`;
    return link;
};

export const buildCaseLink = (caseId: string) => {
    const link = `/cases/${caseId}/progress`;
    return link;
};

export const getStatusDuration = (t: TFunction, date: string, taskStatus: string) => {
    const { unit: updatedUnit, count: updatedCount } = getTimeAgoUnitValue(date) || {};

    let statusDuration = '';

    if (taskStatus === 'IN_PROGRESS' || taskStatus === 'INPROGRESS') {
        statusDuration = t('tasksListing.taskSubmittedAgo', { updatedCount, updatedUnit });
    } else if (taskStatus === 'COMPLETED') {
        statusDuration = t('tasksListing.taskCompletedAgo', { updatedCount, updatedUnit });
    } else if (taskStatus === 'PENDING' || taskStatus === 'NEW') {
        statusDuration = t('tasksListing.taskCreatedAgo', { updatedCount, updatedUnit });
    }

    return statusDuration;
};

const getTaskStatusText = (t: TFunction, status: string) => {
    switch (status) {
        case CaseStatus.Draft:
            return t('tasksListing.taskStatus.draft');
        case CaseStatus.Pending:
            return t('tasksListing.taskStatus.pending');
        case CaseStatus.Cancelled:
            return t('tasksListing.taskStatus.cancelled');
        case CaseStatus.CompleteDoNotUse:
        case CaseStatus.Submit:
            return t('tasksListing.taskStatus.completed');
        default:
            return toTitleCase(status);
    }
};
export const toFormattedTask = (t: TFunction, task: Task, caseId: string, caseType: string, documentNumber: string, clientId: string) => {
    const statusDuration = getStatusDuration(t, task.updatedDate, task.status);

    return {
        status: task.status,
        taskId: task.id,
        taskInfoLink: buildTaskLink(task.id, caseId, caseType, documentNumber, clientId),
        taskStatus: getTaskStatusText(t, task.status),
        taskName: task.taskName || '-',
        statusDuration: statusDuration,
        userId: task.userId || '-'
    };
};

export const getTimeAgoUnitValue = (date: string): { unit: string; count: number } | null => {
    const today = new Date();
    const lastUpdatedDate = new Date(date);

    if (!today || !lastUpdatedDate || !date) return null;

    const monthsAgo = dayjs().diff(dayjs(date), 'months');
    const weeksAgo = dayjs().diff(dayjs(date), 'weeks');
    const daysAgo = dayjs().diff(dayjs(date), 'days');
    const hoursAgo = dayjs().diff(dayjs(date), 'hours');
    const minutesAgo = dayjs().diff(dayjs(date), 'minutes');

    let unit = 'month';
    let count = monthsAgo;
    if (monthsAgo < 1) {
        unit = 'week';
        count = weeksAgo;
        if (weeksAgo < 1) {
            unit = 'day';
            count = daysAgo;
            if (daysAgo < 1) {
                unit = 'hour';
                count = hoursAgo;

                if (hoursAgo < 1) {
                    unit = 'minute';
                    count = minutesAgo;
                }
            }
        }
    }

    return { unit, count };
};

export const getTaskStatus = (t: TFunction, status: string) => {
    switch (status) {
        case TaskStatus.Open:
            return t('tasksListing.taskStatus.open');
        case TaskStatus.Closed:
            return t('tasksListing.taskStatus.closed');
        case TaskStatus.New:
            return t('tasksListing.taskStatus.new');
        case TaskStatus.Completed:
            return t('tasksListing.taskStatus.completed');
        case TaskStatus.InProgress:
            return t('tasksListing.taskStatus.inProgress');
    }
};
