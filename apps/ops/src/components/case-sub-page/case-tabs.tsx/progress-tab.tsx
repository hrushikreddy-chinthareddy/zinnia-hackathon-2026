import { Accordion as AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent, AccordionHeader } from '@radix-ui/react-accordion';
import { Tag, TagVariant } from '@zinnia/bloom/components';
import { TFunction, useTranslation } from 'next-i18next';
import React, { ForwardedRef, Key, ReactNode, useMemo, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Tooltip from '@deps/components/tooltip/tooltip';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import StepAdditionalData from '@deps/containers/case-overview/step-overview/step-additional-data';
import TaskSideSheet from '@deps/containers/case-overview/tasks-table/sidesheet/task-sidesheet-content';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { AdditionalDataIds } from '@deps/models/case/additional-data-instance';
import { Case, Statuses } from '@deps/models/case/case';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as ExceptionIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    completionPercentageString,
    mapCaseDetails,
    StageView,
    StepView,
    ExceptionView,
    TaskView,
    formatTimestamp,
    AdditionalData,
} from './case-tabs-helpers';

// Provides a status icon and tooltip for step and stage statuses
const getStageStatusIconTooltip = (stage: StageView, t: TFunction): ReactNode => {
    let icon = null;
    let tooltipBody = null;

    switch (stage.status) {
        case Statuses.Completed:
        case 'RESOLVED' as Statuses:
            icon = <CompletedIcon className="text-semantic-success" width={24} height={24} />;
            tooltipBody = t('caseOverview.caseStatus.completed.statusTooltipWithDate', { date: formatTimestamp(stage.updatedAt) });
            break;
        case Statuses.InProgress:
            icon = <InProgressIcon className="text-semantic-info" width={24} height={24} />;
            tooltipBody = t('caseOverview.caseStatus.inProgress.statusTooltipWithDate', { date: formatTimestamp(stage.updatedAt) });
            break;
        case Statuses.NotStarted:
            icon = <NotStartedIcon className="text-gray-300" width={24} height={24} />;
            tooltipBody = t('caseOverview.caseStatus.notStarted.statusTooltip');
            break;
        case Statuses.Exception:
            icon = <ExceptionIcon className="text-semantic-error" width={24} height={24} />;
            tooltipBody = t('caseOverview.caseStatus.exception.statusTooltipWithDate', { date: formatTimestamp(stage.updatedAt) });
            break;
        default:
            return DEFAULT_ERROR_STRING;
    }
    if (tooltipBody) {
        return (
            <Tooltip body={tooltipBody} placement={PopoverPlacement.TopLeft}>
                {icon}
            </Tooltip>
        );
    } else {
        return icon;
    }
};

const getStepStatusIconTooltip = (step: StepView, t: TFunction): ReactNode => {
    let icon = null;
    let tooltipTitle = null;

    switch (step.status) {
        case Statuses.Completed:
        case 'RESOLVED' as Statuses:
            icon = <CompletedIcon className="text-semantic-success" width={16} height={16} />;
            tooltipTitle = t('caseOverview.caseStatus.completed.statusTooltipWithDate', { date: formatTimestamp(step.updatedAt) });
            break;
        case Statuses.InProgress:
            icon = <InProgressIcon className="text-semantic-info" width={16} height={16} />;
            tooltipTitle = t('caseOverview.caseStatus.inProgress.statusTooltipWithDate', { date: formatTimestamp(step.updatedAt) });
            break;
        case Statuses.NotStarted:
            icon = <NotStartedIcon className="text-gray-300" width={16} height={16} />;
            tooltipTitle = t('caseOverview.caseStatus.notStarted.statusTooltip');
            break;
        case Statuses.Exception:
            icon = <ExceptionIcon className="text-semantic-error" width={16} height={16} />;
            tooltipTitle = t('caseOverview.caseStatus.exception.statusTooltipWithDate', { date: formatTimestamp(step.updatedAt) });
            break;
        default:
            return DEFAULT_ERROR_STRING;
    }
    if (tooltipTitle) {
        const tooltipBody = (
            <>
                <p>{tooltipTitle}</p>
                {step.description && (
                    <>
                        <br />
                        <p>{step.description}</p>
                    </>
                )}
            </>
        );
        return (
            <Tooltip body={tooltipBody} placement={PopoverPlacement.TopRight}>
                {icon}
            </Tooltip>
        );
    } else {
        return icon;
    }
};

enum StepTagIds {
    UnderwritingAccepted = 'underwritingEvalutaion.underwritingDecisionApproved',
    UnderwritingAdverse = 'underwritingEvaluation.underwritingDecisionAdverse',
    UnderwritingDeclined = 'underwritingEvalutaion.underwritingDecisionDeclined',
    SuitabilityReview = 'suitabilityReview.suitabilityReview',
    UserAccepted = 'userDecision.acceptedOffer',
    UserRejected = 'userDecision.rejectedOffer',
    UserExpired = 'userDecision.expireOffer',
    UserAmended = 'userDecision.requestedOfferAmendment',
}

const stepResultTag = (step: StepView, t: TFunction): ReactNode => {
    let text;
    switch (step.id) {
        // Underwriting
        case StepTagIds.UnderwritingAccepted:
            text = t('caseOverview.tabs.accepted');
            break;
        case StepTagIds.UnderwritingAdverse:
            text = t('caseOverview.tabs.adverse');
            break;
        case StepTagIds.UnderwritingDeclined:
            text = t('caseOverview.tabs.declined');
            break;
        // Suitability
        case StepTagIds.SuitabilityReview:
            if (step.status === 'COMPLETED') {
                text = t('caseOverview.tabs.approved');
                break;
            } else {
                text = t('caseOverview.tabs.declined');
                break;
            }
        // User Decision
        case StepTagIds.UserAccepted:
            text = t('caseOverview.tabs.accepted');
            break;
        case StepTagIds.UserRejected:
            text = t('caseOverview.tabs.rejected');
            break;
        case StepTagIds.UserExpired:
            text = t('caseOverview.tabs.expired');
            break;
        case StepTagIds.UserAmended:
            text = t('caseOverview.tabs.amended');
            break;
        default:
            break;
    }
    if (text) {
        return <Tag text={text} variant={TagVariant.White} />;
    }
    return;
};

const Task = ({ task }: { task: TaskView }) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();

    const handleClick = (task: TaskView) => {
        sideSheet.changeSideSheetContent(task.description, <TaskSideSheet taskId={task.id} />);
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
                    <Content contentClassName="min-w-max" variant={ContentVariant.BodySm} details={task.description} />
                    <Content className="min-w-max" variant={ContentVariant.BodySm} details={dateString} />
                </div>
                <ChevronDown className="rotate-270 text-secondary" width={16} height={16} />
            </button>
        </li>
    );
};

const Tasks = ({ tasks }: { tasks: TaskView[] }) => {
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
};

const Exceptions = ({ exceptions, unmapped = false }: { exceptions: ExceptionView[]; unmapped?: boolean }) => {
    const { t } = useTranslation();
    if (!exceptions.length) {
        return null;
    }

    return (
        <ul>
            {exceptions.map(exception => (
                <li className="flex w-full flex-col" key={exception.id}>
                    <div className="flex w-full flex-col justify-between lg:flex-row">
                        <Content
                            className={exception.status === ExceptionStatuses.New ? 'text-semantic-error' : 'text-semantic-success'}
                            contentClassName="mt-1"
                            variant={ContentVariant.BodySm}
                            details={exception.description}
                        />
                        {unmapped && (
                            <Content
                                className="text-gray-600"
                                contentClassName="mt-1"
                                variant={ContentVariant.BodySm}
                                details={t('caseOverview.tabs.since', { date: formatTimestamp(exception.updatedAt) }) as string}
                            />
                        )}
                    </div>
                    <Tasks tasks={exception.tasks} />
                </li>
            ))}
        </ul>
    );
};

const Steps = ({ steps, stepFilter = () => true }: { steps: StepView[]; stepFilter?: (step: StepView) => boolean }) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();
    const showStepDetails = (additionalData: AdditionalData, id: string, status: string, date: string) => {
        if (Object.keys(additionalData).length === 0) {
            return;
        }
        const content = (
            <StepAdditionalData additionalData={additionalData} stepKey={id as AdditionalDataIds} status={status} date={date} />
        );
        sideSheet.changeSideSheetContent(t(`caseManagementApiKeys.steps.${id}`), content);
        sideSheet.handleOpen(true);
    };

    return (
        <ul>
            {steps.filter(stepFilter).map((step, index) => (
                <li
                    key={index}
                    className="flex w-full flex-row justify-between border-b-2 border-gray-100 bg-gray-50 px-4 py-2 first:border-t-2 last:rounded-b-lg last:border-b-0"
                >
                    <div className="flex w-full flex-col">
                        <div className="flex w-full items-center flex-row justify-between ">
                            <div className="flex flex-row gap-2">
                                {getStepStatusIconTooltip(step, t)}
                                <Content variant={ContentVariant.BodySm} details={step.name} />
                                {getStepResultTag(step, t)}
                            </div>
                            {Object.keys(step?.additionalData).length > 0 && (
                                <NavElement
                                    size={NavElementSize.Small}
                                    onClick={() => showStepDetails(step?.additionalData, step.id, step?.status, step?.updatedAt)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            showStepDetails(step?.additionalData, step.id, step?.status, step?.updatedAt);
                                        }
                                    }}
                                    type={NavElementType.Button}
                                    variant={NavElementVariant.Default}
                                >
                                    {t('caseManagementApiKeys.stages.viewDetails')}
                                </NavElement>
                            )}
                        </div>
                        <div className="flex w-full flex-col pl-6">
                            <Exceptions exceptions={step.exceptions} />
                            <Tasks tasks={step.tasks} />
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

const Stage = React.forwardRef(({ stage }: { stage: StageView }, forwardedRef: ForwardedRef<HTMLButtonElement>) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const handleStateChange = (state: boolean) => {
        setIsOpen(state);
    };

    return (
        <AccordionHeader>
            <AccordionTrigger
                className={`inline-flex w-full items-center justify-between ${isOpen ? 'rounded-t-lg' : 'rounded-lg'} px-4  py-2`}
                onClick={() => handleStateChange(!isOpen)}
                ref={forwardedRef}
            >
                <>
                    <div className="flex flex-col gap-1 lg:flex-row lg:gap-2">
                        <div className="flex min-w-max items-center gap-2">
                            <Tooltip
                                placement={PopoverPlacement.TopRight}
                                body={isOpen ? t('caseOverview.tabs.stageCollapseTooltip') : t('caseOverview.tabs.stageExpandTooltip')}
                                isTabbable={false}
                            >
                                <ChevronDown
                                    className={`chevron-down rotate-270 transition-transform duration-300 lg:mt-0 ${
                                        isOpen ? 'rotate-0' : ''
                                    }`}
                                    width={16}
                                    height={16}
                                />
                            </Tooltip>
                            <Typography variant={TypographyVariant.LabelMdAlt}>{stage.name}</Typography>
                        </div>
                        <div className="-mt-[1px] flex items-center gap-0.5 pl-6 lg:pl-0">
                            <Typography className="text-gray-600" variant={TypographyVariant.BodySm}>
                                {t('caseOverview.tabs.stepCount', { count: stage.totalSteps })}
                            </Typography>
                            {stage.nigoSteps !== 0 && (
                                <Typography className="text-gray-600" variant={TypographyVariant.BodySm}>
                                    {`· ${t('caseOverview.tabs.issueCount', { count: stage.nigoSteps })}`}
                                </Typography>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Content
                            className="text-gray-600"
                            variant={ContentVariant.BodySm}
                            details={completionPercentageString(stage.completedSteps, stage.totalSteps, t)}
                        />
                        {getStageStatusIconTooltip(stage, t)}
                    </div>
                </>
            </AccordionTrigger>
        </AccordionHeader>
    );
});
Stage.displayName;

//#region Stages
const Stages = ({ stages, stepFilter = () => true }: { stages: StageView[]; stepFilter?: (step: StepView) => boolean }) => {
    // Default stages with exceptions to opened state.
    const [openedStages, setOpenedStages] = useState<string[]>(
        stages.filter(stage => stage.status === Statuses.Exception).map(stage => stage.id)
    );

    const mapStageToAccordionItem = (stage: StageView) => {
        return (
            <AccordionItem className="rounded-lg border-2 border-gray-100 [&:has(h3:hover)]:border-accent1" key={stage.id} value={stage.id}>
                <Stage stage={stage} />
                <AccordionContent>
                    <Steps steps={stage.steps} stepFilter={stepFilter} />
                </AccordionContent>
            </AccordionItem>
        );
    };

    return (
        <>
            {stages.map((stage: StageView, index: Key) => (
                <AccordionRoot type="multiple" key={index} value={openedStages} onValueChange={setOpenedStages}>
                    {mapStageToAccordionItem(stage)}
                </AccordionRoot>
            ))}
        </>
    );
};

//#region Progress Bar
const StepProgressBar = ({
    completedSteps,
    totalSteps,
    caseStatus,
    unresolvedExceptionCount,
}: {
    caseStatus: Statuses;
    completedSteps: number;
    totalSteps: number;
    unresolvedExceptionCount: number;
}) => {
    const { t } = useTranslation();
    // Only show the progress bar if the case is not canceled or completed
    if ([Statuses.Canceled, Statuses.Completed].includes(caseStatus)) {
        return null;
    }
    let completionBarColor;
    switch (caseStatus) {
        case Statuses.Completed:
            completionBarColor = 'bg--semantic-success';
            break;
        case Statuses.Exception:
            completionBarColor = 'bg-semantic-error';
            break;
        case Statuses.InProgress:
        case Statuses.NotStarted:
        default:
            completionBarColor = 'bg-semantic-info';
            break;
    }
    const percentComplete = Math.round((100 * completedSteps) / totalSteps);
    return (
        <div className="flex w-full flex-row items-center gap-2">
            <div
                aria-label={`Progress: ${completionPercentageString(completedSteps, totalSteps, t)}`}
                aria-labelledby="progressBarId"
                aria-valuenow={percentComplete}
                className="mt-0.5 h-2  w-full max-w-[240px]  rounded bg-gray-100"
                role="progressbar"
            >
                <div className={`h-full rounded-l rounded-r ${completionBarColor}`} style={{ width: `${percentComplete}%` }}></div>
            </div>
            <div className="min-w-max" id="progressBarId">
                <Content
                    className="min-w-max"
                    details={completionPercentageString(completedSteps, totalSteps, t)}
                    variant={ContentVariant.Body}
                />
            </div>
            {!!unresolvedExceptionCount && (
                <Content
                    className="min-w-max text-semantic-error"
                    details={t('caseOverview.tabs.issueCount', { count: unresolvedExceptionCount }) as string}
                    variant={ContentVariant.Body}
                />
            )}
        </div>
    );
};

//#region Progress Bar
export default function ProgressTab({ caseDetails }: { caseDetails: Case }) {
    const { t } = useTranslation();

    const mappedCase = useMemo(() => {
        return mapCaseDetails(caseDetails, t);
    }, [caseDetails, t]);

    return (
        <>
            <CardContainer>
                <div className="flex w-full flex-row items-center gap-4">
                    <Typography variant={TypographyVariant.H2}>{t(`caseOverview.tabs.progress`)}</Typography>
                    <StepProgressBar
                        caseStatus={mappedCase.caseStatus}
                        completedSteps={mappedCase.completedSteps}
                        totalSteps={mappedCase.totalSteps}
                        unresolvedExceptionCount={mappedCase.unresolvedExceptionCount}
                    />
                </div>
                <div className="mt-6 flex flex-col gap-2">
                    <Stages stages={mappedCase.stages} />
                </div>
                {!!mappedCase.unmappedExceptions.length && (
                    <div className="mt-6 flex w-full flex-col">
                        <Typography variant={TypographyVariant.H3}>{t(`caseOverview.tabs.otherIssues`)}</Typography>
                        <div className="mt-3 flex flex-col gap-2">
                            <Exceptions exceptions={mappedCase.unmappedExceptions} unmapped={true} />
                        </div>
                    </div>
                )}
            </CardContainer>
        </>
    );
}
