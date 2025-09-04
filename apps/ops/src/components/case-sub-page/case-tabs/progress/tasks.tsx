import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import GlobalTaskSideSheet from '@deps/components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { Statuses } from '@deps/models/case/case';
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
    TaskType.Duplicate_Review,
    TaskType.Payment_Follow_Up,
    TaskType.Suitaibility_DataEntry_Nigo_Review,
    TaskType.Claims_Identify_Uncashed_Transactions,
    TaskType.Claims_Reverse_Uncashed_Transactions,
    TaskType.Claims_Stop_Uncashed_Transactions,
    TaskType.Background_Nigo,
    TaskType.Background_Review,
    TaskType.Purchase_enrichment,
    TaskType.Cost_Basis_Review,
    TaskType.Claims_Fi_Escheatment_Task,
    TaskType.Bene_Address_Verification,
    TaskType.Claims_Bene_Review,
    TaskType.Bene_Call,
];

type StatusConfigItem = {
    check: (status: Statuses) => boolean;
    key: string;
    dateField: keyof TaskView;
};

export function Task({ task }: { task: TaskView }) {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();
    const { featureFlags } = useOptimizely();

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
                taskDescription={task.description}
            />
        );
        sideSheet.handleOpen(true);
    };

    const statusConfig: StatusConfigItem[] = [
        {
            check: (status: Statuses) =>
                [Statuses.Pending, 'SCHEDULED'].includes(status),
            key: 'caseOverview.tabs.pendingTill',
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

export default function Tasks({ tasks }: { tasks: TaskView[] }) {
    if (!tasks.length) {
        return null;
    }
    return (
        <ul className="mt-2 flex w-full flex-col gap-1">
            {tasks.map((task) => (
                <Task task={task} key={task.id} />
            ))}
        </ul>
    );
}
