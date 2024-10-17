import { TFunction, useTranslation } from 'next-i18next';
import React, { ReactNode } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import StepSideSheetContent, { doesStepHaveSidesheet } from '@deps/components/side-sheet/side-sheet-case-step-details/case-side-sheet';
import Tooltip from '@deps/components/tooltip/tooltip';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { Statuses } from '@deps/models/case/case';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as ExceptionIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import Exceptions from './exceptions';
import { formatTimestamp, TransformedStep } from './progress-tab-helpers';
import Tasks from './tasks';

const getStepStatusIconTooltip = (step: TransformedStep, t: TFunction): ReactNode => {
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

const Step = ({ step, ...rest }: { step: TransformedStep } & React.HTMLAttributes<HTMLLIElement>) => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();
    const hasSidesheet = doesStepHaveSidesheet(step);

    const openSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <Typography variant={TypographyVariant.H2}>{step.name}</Typography>,
            <StepSideSheetContent step={step}></StepSideSheetContent>
        );
        sideSheet.handleOpen(true);
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
                        <Content contentClassName="min-w-max" variant={ContentVariant.BodySm} details={step.name} />
                    </div>
                    {hasSidesheet && (
                        <NavElement type={NavElementType.Button} size={NavElementSize.Small} onClick={openSidesheet}>
                            View details
                        </NavElement>
                    )}
                </div>
                <div className="flex w-full flex-col pl-6">
                    <Exceptions exceptions={step.exceptions} />
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
                <Step step={step} key={index} />
            ))}
        </ul>
    );
}
