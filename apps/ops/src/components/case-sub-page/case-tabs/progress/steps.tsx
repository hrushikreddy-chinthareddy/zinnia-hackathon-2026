import { useQuery } from '@tanstack/react-query';
import { Icon, IconType, Tag, TagVariant } from '@zinnia/bloom/components';
import { TFunction, useTranslation } from 'next-i18next';
import React, { ReactNode } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import useDynamicSideSheet from '@deps/components/side-sheet/dynamic-side-sheet';
import StepSideSheetContent, {
    doesStepHaveSidesheet,
} from '@deps/components/side-sheet/side-sheet-case-step-details/case-side-sheet';
import Tooltip from '@deps/components/tooltip/tooltip';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { Statuses } from '@deps/models/case/case';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as ExceptionIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { formatTimestamp } from '@deps/utils/dates';

import Exceptions from './exceptions';
import { TransformedStep } from './progress-tab-helpers';
import Tasks from './tasks';

enum StepResults {
    Approved = 'approved',
    Success = 'success',
    Declined = 'declined',
    Failure = 'failure',
    Adverse = 'adverse',
    RiskNotAcceptable = 'risk not acceptable',
    Accepted = 'accepted',
    Rejected = 'rejected',
    AmendmentAccepted = 'amendment accepted',
    AmendedOfferRequested = 'amended offer requested',
    Expired = 'expired',
}

enum ParentStageIds {
    AgentValidation = 'agentValidation',
}

const StepResultTag = ({ step }: { step: TransformedStep }) => {
    const { t } = useTranslation();
    let text;
    switch (step?.stepResult?.toLowerCase()) {
        // Underwriting
        case StepResults.Approved:
        case StepResults.Success:
            text = t('caseOverview.tabs.approved');
            break;
        case StepResults.Adverse:
            text = t('caseOverview.tabs.adverse');
            break;
        case StepResults.Declined:
        case StepResults.Failure:
            text = t('caseOverview.tabs.declined');
            break;
        case StepResults.RiskNotAcceptable:
            text = t('caseOverview.tabs.riskNotAcceptable');
            break;
        // User Decision
        case StepResults.Accepted:
            text = t('caseOverview.tabs.accepted');
            break;
        case StepResults.Rejected:
            text = t('caseOverview.tabs.rejected');
            break;
        case StepResults.Expired:
            text = t('caseOverview.tabs.expired');
            break;
        case StepResults.AmendmentAccepted:
            text = t('caseOverview.tabs.amendmentAccepted');
            break;
        case StepResults.AmendedOfferRequested:
            text = t('caseOverview.tabs.amendedOfferRequested');
            break;
        default:
            text = step.stepResult;
            break;
    }

    if (text) {
        return <Tag text={text} variant={TagVariant.White} />;
    }
    return null;
};
const getStepStatusIconTooltip = (
    step: TransformedStep,
    t: TFunction
): ReactNode => {
    let icon = null;
    let tooltipTitle = null;

    switch (step.status) {
        case Statuses.Completed:
        case 'RESOLVED' as Statuses:
            icon = (
                <CompletedIcon
                    className="text-semantic-success"
                    width={16}
                    height={16}
                />
            );
            tooltipTitle = t(
                'caseOverview.caseStatus.completed.statusTooltipWithDate',
                { date: formatTimestamp(step.updatedAt) }
            );
            break;
        case Statuses.InProgress:
            icon = (
                <InProgressIcon
                    className="text-semantic-info"
                    width={16}
                    height={16}
                />
            );
            tooltipTitle = t(
                'caseOverview.caseStatus.inProgress.statusTooltipWithDate',
                { date: formatTimestamp(step.updatedAt) }
            );
            break;
        case Statuses.NotStarted:
            icon = (
                <NotStartedIcon
                    className="text-gray-300"
                    width={16}
                    height={16}
                />
            );
            tooltipTitle = t(
                'caseOverview.caseStatus.notStarted.statusTooltip'
            );
            break;
        case Statuses.Exception:
            icon = (
                <ExceptionIcon
                    className="text-semantic-error"
                    width={16}
                    height={16}
                />
            );
            tooltipTitle = t(
                'caseOverview.caseStatus.exception.statusTooltipWithDate',
                { date: formatTimestamp(step.updatedAt) }
            );
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

const Step = ({
    step,
    ...rest
}: { step: TransformedStep } & React.HTMLAttributes<HTMLLIElement>) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();
    const hasSidesheet = doesStepHaveSidesheet(step);

    const aiEnabledAdditional = step.stepAdditionalData?.find(
        (additional) => additional.label === 'AIEnabledFlag'
    );

    const entityIdAdditional = step.stepAdditionalData?.find(
        (additional) => additional.label === 'PaymentRecordId'
    );

    const isAiEnabled =
        aiEnabledAdditional &&
        String(aiEnabledAdditional.value).toLowerCase() === 'true';

    const entityId = entityIdAdditional?.value;

    const { data: transactionEntity } = useQuery({
        queryKey: ['requestInitiateWithBillingPartner', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const openDynamicSideSheetWithTabs = useDynamicSideSheet(
        transactionEntity ? transactionEntity.entity : undefined
    );

    const openSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <Typography variant={TypographyVariant.H3}>{step.name}</Typography>,
            <StepSideSheetContent step={step}></StepSideSheetContent>
        );
        sideSheet.handleOpen(true);
    };

    const hasPii = step.parentStage.id === ParentStageIds.AgentValidation;

    const handleClick = () => {
        if (transactionEntity?.entity?.tabs) {
            openDynamicSideSheetWithTabs();
        } else {
            openSidesheet();
        }
    };

    return (
        <li
            {...rest}
            className="flex w-full flex-row justify-between border-b-2 border-gray-100 bg-gray-50 px-4 py-2 first:border-t-2 last:rounded-b-lg last:border-b-0"
        >
            <div className="flex w-full flex-col">
                <div className="mr-4 flex w-full flex-row items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2 justify-self-start">
                        {getStepStatusIconTooltip(step, t)}
                        <Content
                            contentClassName="min-w-max"
                            variant={ContentVariant.BodySm}
                            details={step.name}
                            pii={hasPii}
                        />
                        {isAiEnabled && (
                            <Tooltip
                                placement={PopoverPlacement.TopRight}
                                body={t('caseOverview.tabs.aiIndicatorTooltip')}
                                isTabbable={false}
                            >
                                <Icon
                                    width={16}
                                    height={16}
                                    className="shrink-0 text-orange-400"
                                    type={IconType.SPARKLES}
                                    alt="AI"
                                />
                            </Tooltip>
                        )}
                        <StepResultTag step={step} />
                        {step.documents?.length > 0 && (
                            <div className="flex flex-row items-center gap-0.5 text-gray-600">
                                <Icon
                                    width={16}
                                    height={16}
                                    className="shrink-0"
                                    type={IconType.DOCUMENT_TEXT}
                                    alt={
                                        t(
                                            'caseOverview.tabs.documents'
                                        ) as string
                                    }
                                />
                                <Content
                                    variant={ContentVariant.BodySm}
                                    details={`${step.documents.length}`}
                                />
                            </div>
                        )}
                    </div>
                    {hasSidesheet && (
                        <NavElement
                            type={NavElementType.Button}
                            size={NavElementSize.Small}
                            onClick={handleClick}
                        >
                            {t('caseOverview.tabs.viewDetails')}
                        </NavElement>
                    )}
                </div>
                <div className="flex w-full flex-col pl-6">
                    <Exceptions
                        exceptions={step.exceptions}
                        groupedExceptions={step.exceptionsGroupedByTask}
                    />
                    <Tasks tasks={step.tasks} />
                </div>
            </div>
        </li>
    );
};

export default function Steps({
    steps,
    stepFilter = () => true,
    ...rest
}: {
    steps: TransformedStep[];
    stepFilter?: (step: TransformedStep) => boolean;
} & React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul {...rest}>
            {steps.filter(stepFilter).map((step, index) => (
                <Step key={index} step={step} />
            ))}
        </ul>
    );
}
