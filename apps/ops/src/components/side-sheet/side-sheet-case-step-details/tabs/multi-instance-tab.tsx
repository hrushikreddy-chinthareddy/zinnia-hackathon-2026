import { Button } from '@zinnia/bloom/components';
import { useTranslation, TFunction } from 'next-i18next';

import { formatTimestamp, TransformedStep } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import { ExceptionView, TaskView, GroupedExceptions } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import Content, { ContentVariant } from '@deps/components/content/content';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import GlobalTaskSideSheet from '@deps/components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { Statuses } from '@deps/models/case/case';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as ExceptionIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

const getStepStatusText = (step: TransformedStep, t: TFunction): { icon: React.ReactNode; text: string } => {
    switch (step.status) {
        case Statuses.Completed:
        case 'RESOLVED' as Statuses:
            return {
                text: t('caseOverview.caseStatus.completed.statusTooltipWithDate', { date: formatTimestamp(step.updatedAt) }),
                icon: <CompletedIcon className="text-semantic-success" width={16} height={16} />,
            };
        case Statuses.InProgress:
            return {
                text: t('caseOverview.caseStatus.inProgress.statusTooltipWithDate', { date: formatTimestamp(step.updatedAt) }),
                icon: <InProgressIcon className="text-semantic-info" width={16} height={16} />,
            };
        case Statuses.NotStarted:
            return {
                text: t('caseOverview.caseStatus.notStarted.statusTooltip'),
                icon: <NotStartedIcon className="text-gray-300" width={16} height={16} />,
            };
        case Statuses.Exception:
            return {
                text: t('caseOverview.caseStatus.exception.statusTooltipWithDate', { date: formatTimestamp(step.updatedAt) }),
                icon: <ExceptionIcon className="text-semantic-error" width={16} height={16} />,
            };
        default:
            return { text: step.status, icon: null };
    }
};

function SideSheetTask({ task }: { task: TaskView }) {
    const { t } = useTranslation();
    const sidesheet = useSideSheetContext();
    const openSideSheet = () => {
        sidesheet.openSecondarySideSheet(task.description, <GlobalTaskSideSheet taskId={task.id} />);
    };
    return (
        <div className={`flex flex-row items-center justify-start ${task.description ? 'gap-1' : ''} `}>
            <Content variant={ContentVariant.BodySm} details={task.taskName || task.description} />
            <Button mode="link" size="small" onClick={() => openSideSheet()}>
                {t('caseOverview.sidesheet.viewTask')}
            </Button>
        </div>
    );
}

function SideSheetException({ exception }: { exception: ExceptionView }) {
    return (
        <div>
            <Content
                className={exception.status === ExceptionStatuses.New ? 'text-semantic-error' : 'text-semantic-success'}
                variant={ContentVariant.BodySm}
                details={exception.description}
            />
        </div>
    );
}

function Exceptions({ exceptions, groupedExceptions }: { exceptions: ExceptionView[]; groupedExceptions: GroupedExceptions }) {
    if (!exceptions?.length) {
        return null;
    }

    return (
        <ul>
            {Object.entries(groupedExceptions).map(([taskId, group]) => (
                <li className="flex w-full flex-col" key={taskId}>
                    {group.exceptions.map(exception => (
                        <div key={exception.id}>{SideSheetException({ exception })}</div>
                    ))}
                    {group.tasks.length > 0 && <SideSheetTask task={group.tasks[0]} key={group.tasks[0].id} />}
                </li>
            ))}
        </ul>
    );
}

function SideSheetStep({ step }: { step: TransformedStep }) {
    const { t } = useTranslation();
    const { icon, text } = getStepStatusText(step, t);

    return (
        <div className="flex flex-row gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">{icon}</div>
            <div className="flex w-full flex-col gap-1">
                <Content variant={ContentVariant.BodySm} details={step.name} />
                {step?.tasks?.map(task => (
                    <SideSheetTask task={task} key={task.id} />
                ))}
                <Exceptions exceptions={step.exceptions} groupedExceptions={step.exceptionsGroupedByTask} />
                <Content className="text-gray-600" variant={ContentVariant.BodySm} details={text} />
            </div>
        </div>
    );
}

export default function MultiInstanceTab({ step, ...rest }: { step: TransformedStep } & React.HTMLAttributes<HTMLDivElement>) {
    const { t } = useTranslation();
    return (
        <div {...rest}>
            <Typography variant={TypographyVariant.H3}>{t('caseOverview.sidesheet.multiInstance')}</Typography>
            <ul className="mt-4">
                {step.substeps?.map(substep => (
                    <li className="my-4" key={substep.id}>
                        <SideSheetStep step={substep} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
