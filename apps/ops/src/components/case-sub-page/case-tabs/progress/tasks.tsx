import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import GlobalTaskSideSheet from '@deps/components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { useTaskIdFromUrl } from '@deps/hooks/useTaskIdFromUrl';
import { Statuses } from '@deps/models/case/case';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

import { TaskView } from './progress-tab-types';

type StatusConfigItem = {
    check: (status: Statuses) => boolean;
    key: string;
    dateField: keyof TaskView;
};

export function Task({
    task,
    isAccordionOpen = true,
}: {
    task: TaskView;
    isAccordionOpen?: boolean;
}) {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContextLegacy();
    const { featureFlags } = useOptimizely();
    const router = useRouter();
    const clientCaseId = router.query.id as string;

    const handleClick = (task: TaskView) => {
        sideSheet.changeSideSheetContent(
            `${
                task.taskName
                    ? `${t('sideSheet.task.taskHeading')}: ${task.taskName}`
                    : t('sideSheet.task.taskHeading')
            }`,

            <GlobalTaskSideSheet
                featureFlagDecisions={featureFlags}
                taskId={task.id}
                caseId={clientCaseId || ''}
                taskDescription={task.description}
            />
        );
        sideSheet.handleOpen(true);
    };

    useTaskIdFromUrl({
        taskId: task.id,
        onTaskIdMatch: () => handleClick(task),
        isReady: isAccordionOpen,
    });

    const statusConfig: StatusConfigItem[] = [
        {
            check: (status: Statuses) =>
                [Statuses.Pending, TaskStatus.Scheduled].includes(status),
            key: 'caseOverview.tabs.scheduledTill',
            dateField: 'updatedAt',
        },
        {
            check: (status: Statuses) =>
                [
                    Statuses.New,
                    Statuses.InProgress,
                    'OPEN',
                    Statuses.NotStarted,
                    Statuses.Inprogress,
                    TaskStatus.Scheduled,
                ].includes(status),
            key: 'caseOverview.tabs.openSince',
            dateField: 'createdAt',
        },
        {
            check: (status: Statuses) => status === 'CANCELED',
            key: 'caseOverview.tabs.canceledOn',
            dateField: 'updatedAt',
        },
        {
            check: () => true,
            key: 'caseOverview.tabs.closedOn',
            dateField: 'updatedAt',
        },
    ];

    const match = statusConfig.find(({ check }) =>
        check(task.status as Statuses)
    );

    const dateValue = match?.dateField
        ? task?.[match?.dateField as keyof TaskView]
        : undefined;

    const dateString = t(match?.key || '', {
        date: convertKebabedDateString(dateValue as string),
    });

    return (
        <li className={`flex w-full flex-row items-center gap-2`}>
            <button
                aria-label={
                    t('caseOverview.tabs.taskSideSheetLabel', {
                        task: task.description,
                    }) as string
                }
                className="default-focus default-hover flex w-full flex-row items-center gap-4 rounded-md border-2 border-gray-100 px-4 py-2"
                onClick={() => handleClick(task)}
            >
                <div className="flex w-full flex-col justify-between lg:flex-row">
                    <Content
                        contentClassName="min-w-max"
                        variant={ContentVariant.BodySm}
                        details={
                            task.taskName
                                ? task.taskName
                                : (t(
                                      'caseOverview.tabs.reviewIssues'
                                  ) as string)
                        }
                    />

                    <Content
                        className="min-w-max"
                        variant={ContentVariant.BodySm}
                        details={dateString}
                    />
                </div>
                <ChevronDown
                    data-testid="chevron-down-icon"
                    className="rotate-270 text-secondary"
                    width={16}
                    height={16}
                />
            </button>
        </li>
    );
}

export default function Tasks({
    tasks,
    isAccordionOpen = true,
}: {
    tasks: TaskView[];
    isAccordionOpen?: boolean;
}) {
    if (!tasks.length) {
        return null;
    }
    return (
        <ul className="mt-2 flex w-full flex-col gap-1">
            {tasks.map((task) => (
                <Task
                    task={task}
                    key={task.id}
                    isAccordionOpen={isAccordionOpen}
                />
            ))}
        </ul>
    );
}
