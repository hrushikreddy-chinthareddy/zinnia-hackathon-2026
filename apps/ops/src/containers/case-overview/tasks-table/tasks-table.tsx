import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React, { useContext } from 'react';

import { CASE_OVERVIEW_TEXT, CaseOverviewNavDrawerContext } from '@deps/contexts/CaseOverviewNavDrawer';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { ReactComponent as OpenIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as ClosedIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import TaskSideSheet from './sidesheet/task-sidesheet-content';

interface TasksTableProps {
    caseId: string;
    tasks: ManagementTask[];
}

const TaskStatusMap: Record<TaskStatus, string> = {
    [TaskStatus.Open]: 'open',
    [TaskStatus.Closed]: 'closed',
    [TaskStatus.Completed]: 'COMPLETED',
    [TaskStatus.New]: 'NEW',
    [TaskStatus.InProgress]: 'INPROGRESS',
}

const statusOrderHelper: Record<string, number> = {
    [TaskStatus.Open]: 0,
    [TaskStatus.Closed]: 1,
};

const taskSorter = (taskA: ManagementTask, taskB: ManagementTask) => {
    const aDateField = taskA.status === TaskStatus.Closed ? taskA.updatedAt : taskA.createdAt;
    const bDateField = taskB.status === TaskStatus.Closed ? taskB.updatedAt : taskB.createdAt;

    return (
        (statusOrderHelper[taskA.status] || 0) - (statusOrderHelper[taskB.status] || 0) ||
        new Date(bDateField).valueOf() - new Date(aDateField).valueOf()
    );
};

const TaskRow = ({ task, handleClick }: { task: ManagementTask; handleClick: () => void }) => {
    const { t } = useTranslation();
    const { unit, count } = getTimeAgoUnitValue(task.status === TaskStatus.Closed ? task.updatedAt : task.createdAt) || {};
    let timestampKey;
    let icon;
    let text;

    switch (task.status) {
        case TaskStatus.Closed:
            icon = <ClosedIcon className="text-semantic-success" height={16} width={16} />;
            text = 'tasks.closed';
            timestampKey = 'tasks.closedFor';
            break;
        case TaskStatus.Open:
        default:
            icon = <OpenIcon className="text-gray-300" height={16} width={16} />;
            text = !TaskStatusMap[task.status] ? toSentenceCase(task.status) : 'tasks.open';
            timestampKey = 'tasks.openFor';
            break;
    }

    return (
        <tr>
            <td className="right-align hug">
                <div className="flex items-center gap-2" aria-label={t(text) as string}>
                    {icon}
                    {t(text)}
                </div>
            </td>
            <td>
                <button
                    className="block overflow-hidden text-ellipsis whitespace-nowrap text-secondary underline hover:text-secondary-dark"
                    onClick={handleClick}
                >
                    {task.taskName}
                </button>
            </td>
            <td className="hug right-align">{t(timestampKey, { unit, count })}</td>
        </tr>
    );
};

export default function TasksTable({ tasks, caseId }: TasksTableProps) {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();
    const [selectedNavItem] = useContext(CaseOverviewNavDrawerContext);

    const isCaseOverview = selectedNavItem === CASE_OVERVIEW_TEXT;
    const handleClick = (task: ManagementTask) => {
        sideSheet.changeSideSheetContent(task.taskName, <TaskSideSheet taskId={task.id} />);
        sideSheet.handleOpen(true);
    };

    if (!isCaseOverview) return null;

    return (
        <div className="table-scroll-container rounded-b-lg rounded-t-lg">
            <table className="scrollable-table">
                <caption className="hidden">{`${caseId} ${t('caseOverview.tasks.tasks')}`}</caption>
                <thead>
                    <tr>
                        <th className={clsx('hug', { 'disabled-th': !tasks.length })}>{t('caseOverview.tasks.status')}</th>
                        <th className={clsx({ 'disabled-th': !tasks.length })}>{t('caseOverview.tasks.task')}</th>
                        <th className="hug disabled-th">
                            <span className="sr-only">{t('caseOverview.tasks.taskAge')}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.sort(taskSorter).map(task => (
                        <TaskRow task={task} key={`task-${task.id}`} handleClick={() => handleClick(task)} />
                    ))}
                    {!tasks.length && (
                        <tr className="disabled-tr">
                            <td colSpan={2}>{t('caseOverview.tasks.noItemsToDisplay')}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
