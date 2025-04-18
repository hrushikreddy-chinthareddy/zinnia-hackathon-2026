import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import GlobalTaskSideSheet from '@deps/components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { Statuses } from '@deps/models/case/case';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';
import { TaskType } from '@deps/models/case/task';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

import { TaskView } from './progress-tab-types';

export const SupportedTaskMap = [
    TaskType.SuitabilityReview,
    TaskType.SuitabilityDataEntry,
    TaskType.PURCHASE_DOCUMENT_MATCHING,
    TaskType.Agent_Nigo,
    TaskType.Attachment_Nigo,
    TaskType.Application_Nigo,
    TaskType.PremiumNigo,
    TaskType.Review_Ofac,
    TaskType.Agent_Onboarding_Nigo,
    TaskType.TOA_Nigo,
    TaskType.Agent_Review,
    TaskType.Standard_Document_Matching,
    TaskType.Application_Review,
    TaskType.AppDataEntry,
    TaskType.Prenote_Nigo,
    TaskType.Agent_Onboarding_Review,
    TaskType.ReturnPayment,
    TaskType.Send_Nigo_Communication,
    TaskType.Initiate_Postissue_Transaction,
    TaskType.TOA_Review,
    TaskType.Prenote_Review,
    TaskType.Payment_Processing_Review,
];

export function Task({ task }: { task: TaskView }) {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();

    const handleClick = (task: TaskView) => {
        sideSheet.changeSideSheetContent(
            `${task.taskName ? `${t('sideSheet.task.taskHeading')}: ${task.taskName}` : t('sideSheet.task.taskHeading')}`,

            <GlobalTaskSideSheet taskId={task.id} taskDescription={task.description} />
        );
        sideSheet.handleOpen(true);
    };

    const dateString = [Statuses.New, Statuses.InProgress, 'OPEN', Statuses.NotStarted, Statuses.Inprogress, Statuses.Pending].includes(
        task.status
    )
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
                        details={task.taskName ? task.taskName : (t('caseOverview.tabs.reviewIssues') as string)}
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
