import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    Accordion as AccordionRoot,
    AccordionTrigger,
} from '@radix-ui/react-accordion';
import { useSearchParams } from 'next/navigation';
import { TFunction, useTranslation } from 'next-i18next';
import React, {
    ForwardedRef,
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Tooltip from '@deps/components/tooltip/tooltip';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { useTaskIdFromUrl } from '@deps/hooks/useTaskIdFromUrl';
import { Case, Statuses } from '@deps/models/case/case';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as ExceptionIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';
import {
    CaseStageAccordionClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import { formatTimestamp } from '@deps/utils/dates';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import Exceptions from './exceptions';
import {
    completionPercentageString,
    TransformedCase,
    TransformedStage,
    TransformedStep,
} from './progress-tab-helpers';
import Steps from './steps';
import Tasks from './tasks';

// Provides a status icon and tooltip for step and stage statuses

const getSentenceCase = (text: string) => {
    const sentence = text.trim().toLowerCase();
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

const getStageStatusIconTooltip = (
    stage: TransformedStage,
    t: TFunction
): ReactNode => {
    let icon = null;
    let tooltipBody = null;
    let contentBody = null;

    switch (stage.status) {
        case Statuses.Completed:
        case 'RESOLVED' as Statuses:
            icon = (
                <CompletedIcon
                    className="text-semantic-success"
                    width={24}
                    height={24}
                />
            );
            tooltipBody = t(
                'caseOverview.caseStatus.completed.statusTooltipWithDate',
                { date: formatTimestamp(stage.updatedAt, 'tooltip') }
            );
            contentBody = t(
                'caseOverview.caseStatus.completed.statusTooltipWithDate',
                {
                    date: formatTimestamp(stage.updatedAt, 'monthDay'),
                }
            );
            break;
        case Statuses.InProgress:
            icon = (
                <InProgressIcon
                    className="text-semantic-info"
                    width={24}
                    height={24}
                />
            );
            tooltipBody = t(
                'caseOverview.caseStatus.inProgress.statusTooltipWithDate',
                { date: formatTimestamp(stage.updatedAt, 'tooltip') }
            );
            contentBody = t(
                'caseOverview.caseStatus.inProgress.statusTooltipWithDate',
                {
                    date: formatTimestamp(stage.updatedAt, 'monthDay'),
                }
            );
            break;
        case Statuses.NotStarted:
            icon = (
                <NotStartedIcon
                    className="text-gray-300"
                    width={24}
                    height={24}
                />
            );
            tooltipBody = t('caseOverview.caseStatus.notStarted.statusTooltip');
            contentBody = t('caseOverview.caseStatus.notStarted.statusTooltip');
            break;
        case Statuses.Exception:
            icon = (
                <ExceptionIcon
                    className="text-semantic-error"
                    width={24}
                    height={24}
                />
            );
            tooltipBody = t(
                'caseOverview.caseStatus.exception.statusTooltipWithDate',
                { date: formatTimestamp(stage.updatedAt, 'tooltip') }
            );
            contentBody = t(
                'caseOverview.caseStatus.exception.statusTooltipWithDate',
                {
                    date: formatTimestamp(stage.updatedAt, 'monthDay'),
                }
            );
            break;
        default:
            return DEFAULT_ERROR_STRING;
    }
    if (tooltipBody && contentBody) {
        return (
            <>
                <Tooltip
                    body={tooltipBody}
                    placement={PopoverPlacement.TopLeft}
                >
                    <Typography
                        className="text-gray-600"
                        variant={TypographyVariant.BodySm}
                    >
                        {contentBody}
                    </Typography>
                </Tooltip>
                <Tooltip
                    body={tooltipBody}
                    placement={PopoverPlacement.TopLeft}
                >
                    {icon}
                </Tooltip>
            </>
        );
    } else {
        return icon;
    }
};

const Stage = React.forwardRef(
    (
        { stage }: { stage: TransformedStage },
        forwardedRef: ForwardedRef<HTMLButtonElement>
    ) => {
        const { t } = useTranslation();
        const { sessionId, partyId } = usePermissionsContext();
        const [isOpen, setIsOpen] = useState(false);

        const handleStateChange = (state: boolean) => {
            setIsOpen(state);

            segmentAnalyticsTrackEvent<CaseStageAccordionClickedEvent>(
                SegmentTrackedEventName.CaseStageAccordionClicked,
                {
                    caseId: stage.parentCase.caseRaw.id,
                    authSessionId: sessionId,
                    userId: partyId,
                    isOpen: state,
                    stageId: stage.id,
                    stageName: stage.name,
                }
            );
        };

        return (
            <AccordionHeader>
                <AccordionTrigger
                    className={`flex flex-wrap w-full items-center justify-between ${
                        isOpen ? 'rounded-t-lg' : 'rounded-lg'
                    } px-4  py-2`}
                    onClick={() => handleStateChange(!isOpen)}
                    ref={forwardedRef}
                >
                    <>
                        <div className="flex gap-2">
                            <Tooltip
                                placement={PopoverPlacement.TopRight}
                                body={
                                    isOpen
                                        ? t(
                                              'caseOverview.tabs.stageCollapseTooltip'
                                          )
                                        : t(
                                              'caseOverview.tabs.stageExpandTooltip'
                                          )
                                }
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
                            <Typography
                                className="break-words w-full"
                                style={{ textAlign: 'left' }}
                                variant={TypographyVariant.LabelMdAlt}
                            >
                                {getSentenceCase(stage.name)}
                            </Typography>
                        </div>
                        <div className="flex items-center gap-2 pl-6">
                            {getStageStatusIconTooltip(stage, t)}
                        </div>
                    </>
                </AccordionTrigger>
            </AccordionHeader>
        );
    }
);
// TODO MG: add comment for what this is for
Stage.displayName;

//#region Stages
const Stages = ({
    stages,
    stepFilter = () => true,
}: {
    stages: TransformedStage[];
    stepFilter?: (step: TransformedStep) => boolean;
}) => {
    const searchParams = useSearchParams();
    const taskIdFromUrl = searchParams.get('taskId');
    // Default stages with exceptions to opened state
    const [openedStages, setOpenedStages] = useState<string[]>(
        stages
            .filter((stage) => stage.status === Statuses.Exception)
            .map((stage) => stage.id)
    );

    const foundStageId = useMemo(() => {
        if (!taskIdFromUrl) return undefined;
        return stages.find((stage) =>
            stage.steps.some(
                (step) =>
                    step.tasks.some((task) => task.id === taskIdFromUrl) ||
                    Object.keys(step.exceptionsGroupedByTask).includes(
                        taskIdFromUrl
                    )
            )
        )?.id;
    }, [taskIdFromUrl, stages]);

    const foundStageIdRef = useRef(foundStageId);
    useEffect(() => {
        foundStageIdRef.current = foundStageId;
    }, [foundStageId]);

    useTaskIdFromUrl({
        taskId: foundStageId && taskIdFromUrl ? taskIdFromUrl : undefined,
        onTaskIdMatch: () => {
            const currentStageId = foundStageIdRef.current;
            if (currentStageId) {
                setOpenedStages([currentStageId]);
            }
        },
    });

    return (
        <>
            {stages.map((stage, index) => {
                const isAccordionOpen = openedStages.includes(stage.id);
                return (
                    <AccordionRoot
                        type="multiple"
                        key={index}
                        value={openedStages}
                        onValueChange={setOpenedStages}
                    >
                        <AccordionItem
                            className="rounded-lg border-2 border-gray-100 [&:has(h3:hover)]:border-accent1"
                            key={stage.id}
                            value={stage.id}
                        >
                            <Stage stage={stage} />
                            <AccordionContent>
                                <Steps
                                    steps={stage.steps}
                                    stepFilter={stepFilter}
                                    isAccordionOpen={isAccordionOpen}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </AccordionRoot>
                );
            })}
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
            completionBarColor = 'bg-semantic-success';
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
                aria-labelledby="progressBarId"
                aria-valuenow={percentComplete}
                className="mt-0.5 h-2  w-full max-w-[240px]  rounded bg-gray-100"
                role="progressbar"
            >
                <div
                    className={`h-full rounded-l rounded-r ${completionBarColor}`}
                    style={{ width: `${percentComplete}%` }}
                ></div>
            </div>
            <div className="min-w-max" id="progressBarId">
                <Content
                    className="min-w-max"
                    details={completionPercentageString(
                        completedSteps,
                        totalSteps,
                        t
                    )}
                    variant={ContentVariant.Body}
                />
            </div>
            {!!unresolvedExceptionCount && (
                <Content
                    className="min-w-max text-semantic-error"
                    details={
                        t('caseOverview.tabs.issueCount', {
                            count: unresolvedExceptionCount,
                        }) as string
                    }
                    variant={ContentVariant.Body}
                />
            )}
        </div>
    );
};

//#region Progress Bar
export default function ProgressTab({ caseDetails }: { caseDetails: Case }) {
    const { t } = useTranslation();

    const transformedCase = useMemo(() => {
        return new TransformedCase(caseDetails, t);
    }, [caseDetails, t]);

    return (
        <>
            <CardContainer>
                <div className="flex w-full flex-row items-center gap-4">
                    <Typography variant={TypographyVariant.H2}>
                        {t(`caseOverview.tabs.progress`)}
                    </Typography>
                    <StepProgressBar
                        caseStatus={transformedCase.caseStatus}
                        completedSteps={transformedCase.completedSteps}
                        totalSteps={transformedCase.totalSteps}
                        unresolvedExceptionCount={
                            transformedCase.unresolvedExceptionCount
                        }
                    />
                </div>
                <div className="mt-6 flex flex-col gap-2">
                    <Stages stages={transformedCase.stages} />
                </div>
                {(!!transformedCase.unmappedExceptions.length ||
                    !!transformedCase.unmappedTasks.length) && (
                    <div className="mt-6 flex w-full flex-col">
                        <Typography variant={TypographyVariant.H3}>
                            {t(`caseOverview.tabs.otherIssues`)}
                        </Typography>

                        <div className="mt-3 flex flex-col gap-2">
                            <Exceptions
                                exceptions={transformedCase.unmappedExceptions}
                                unmapped={true}
                                groupedExceptions={
                                    transformedCase.exceptionsGroupedByTask
                                }
                            />
                            <Tasks tasks={transformedCase.unmappedTasks} />
                        </div>
                    </div>
                )}
            </CardContainer>
        </>
    );
}
