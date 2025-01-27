import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import TaskSideSheet from '@deps/containers/case-overview/tasks-table/sidesheet/task-sidesheet-content';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { Statuses } from '@deps/models/case/case';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';
import { TaskType } from '@deps/models/case/task';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import GlobalTaskSideSheet from '@deps/containers/case-overview/tasks-table/sidesheet/global-task-sidesheet-content';

import { TaskView } from './progress-tab-types';

const SupportedTaskMap = [TaskType.SuitabilityReview, TaskType.SuitabilityDataEntry];

export function Task({ task }: { task: TaskView }) {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();

    const TaskTitle: Record<string, string> = {
        [TaskType.SuitabilityReview]: t('caseOverview.tabs.suitabilityReviewIssues'),
    };

    const TaskTypeMap: Record<string, string> = {
        [TaskType.SuitabilityReview]: t('caseOverview.tabs.suitabilityReview'),
    };

    const handleClick = (task: TaskView) => {
        sideSheet.changeSideSheetContent(
            `${t('sideSheet.task.taskHeading')}: ${TaskTitle[task.description] ? TaskTitle[task.description] : task?.description ?? ''}`,
            SupportedTaskMap.includes(task.description as TaskType) ? (
                <GlobalTaskSideSheet taskId={task.id} />
            ) : (
                <TaskSideSheet taskId={task.id} />
            )
        );
        sideSheet.handleOpen(true);
    };

    const dateString = [Statuses.New, Statuses.InProgress, 'OPEN', Statuses.NotStarted].includes(task.status)
        ? t('caseOverview.tabs.openSince', { date: convertKebabedDateString(task.createdAt) })
        : t('caseOverview.tabs.closedOn', { date: convertKebabedDateString(task.updatedAt) });

    let beforeClasses = '';

    // if the task is part of an exception, add a dot before the task and change the color depending on the status
    if (task.hasParentException) {
        beforeClasses = `before:text-[32px] before:content-["·"] ${
            task.parentExceptionStatus === ExceptionStatuses.Resolved ? 'before:text-semantic-success' : 'before:text-semantic-error'
        }`;
    }

    return (
        <li className={`flex w-full flex-row items-center gap-2 ${beforeClasses} `}>
            <button
                aria-label={t('caseOverview.tabs.taskSideSheetLabel', { task: task.description }) as string}
                className="default-focus default-hover flex w-full flex-row items-center gap-4 rounded-md border-2 border-gray-100 px-4 py-2"
                onClick={() => handleClick(task)}
            >
                <div className="flex w-full flex-col justify-between lg:flex-row">
                    <Content
                        contentClassName="min-w-max"
                        variant={ContentVariant.BodySm}
                        details={t('caseOverview.tabs.reviewIssues', { taskType: TaskTypeMap[task.description] }) as string}
                    />
                    <Content className="min-w-max" variant={ContentVariant.BodySm} details={dateString} />
                </div>
                <ChevronDown className="rotate-270 text-secondary" width={16} height={16} />
            </button>
        </li>
    );
}

export default function Tasks({ tasks }: { tasks: TaskView[] }) {
    if (!tasks.length) {
        return null;
    }
    return (
        <ul className="mt-2 flex w-full flex-col gap-1">
            {tasks.map(task => (
                <Task task={task} key={task.id} />
            ))}
        </ul>
    );
}
