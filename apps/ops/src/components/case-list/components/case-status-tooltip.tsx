import {
    BadgeVariant,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { useTranslation } from 'next-i18next';
import { cloneElement, ReactElement, ReactNode } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { Case, Statuses } from '@deps/models/case/case';

interface GetStatusDetailsProps {
    singleCase: Case;
    t: TFunction;
    issueDate?: string;
}

interface CaseStatusTooltipProps {
    trigger: ReactNode;
    singleCase: Case;
}

const generateTooltipId = (caseId: string | number) =>
    `case-status-tooltip-${caseId}`;

export const getStatusDetails = ({
    singleCase,
    t,
    issueDate,
}: GetStatusDetailsProps) => {
    const {
        caseStatus,
        caseResult,
        processSubType,
        process,
        createdAt,
        exceptions,
        updatedAt,
        caseResultDetail,
    } = singleCase;
    const daysAgo = calculateDaysAgo(new Date(singleCase.createdAt));

    let statusTooltip = '';
    let statusVariant = '';
    let statusText = '';

    switch (caseStatus) {
        case Statuses.InProgress:
            statusVariant = BadgeVariant.INFO;
            statusTooltip = `${t('caseOverview.caseStatus.inProgress.tooltip', {
                processSubType: processSubType
                    ? toTitleCase(processSubType)
                    : toTitleCase(process),
            })}${dayjs(createdAt).format('MM/DD/YYYY')}${t(
                'caseOverview.caseStatus.inProgress.tooltip2',
                {
                    daysAgo: daysAgo,
                }
            )}`;
            statusText = t('caseOverview.caseStatus.inProgress.badgeText');
            break;

        case Statuses.Exception:
            statusVariant = BadgeVariant.ERROR;
            if (exceptions.length !== 0) {
                statusTooltip = `${t(
                    'caseOverview.caseStatus.exception.tooltip',
                    {
                        processSubType: processSubType
                            ? toTitleCase(processSubType)
                            : toTitleCase(process),
                    }
                )}${t('caseOverview.caseStatus.exception.tooltip2', {
                    exceptions: exceptions.length,
                })}`;
            } else {
                statusTooltip = t(
                    'caseOverview.caseStatus.zeroException.tooltip',
                    {
                        requestSubType: processSubType
                            ? toTitleCase(processSubType)
                            : toTitleCase(process),
                    }
                );
            }
            statusText = t('caseOverview.caseStatus.exception.badgeText');
            break;

        case Statuses.Canceled:
            statusVariant = BadgeVariant.INACTIVE;
            statusTooltip = `${t('caseOverview.caseStatus.canceled.tooltip', {
                processSubType: processSubType
                    ? toTitleCase(processSubType)
                    : toTitleCase(process),
            })}${dayjs(updatedAt).format('MM/DD/YYYY')}. ${
                caseResultDetail || ''
            }`;
            statusText = t('caseOverview.caseStatus.canceled.badgeText');
            break;

        case Statuses.Completed:
            if (caseResult === Statuses.Issued && issueDate) {
                statusVariant = BadgeVariant.SUCCESS;
                statusTooltip = t('caseOverview.caseStatus.issued.tooltip', {
                    date: dayjs(updatedAt).format('MM/DD/YYYY'),
                    issueDate: dayjs(issueDate).format('MM/DD/YYYY'),
                    processSubType: processSubType
                        ? toTitleCase(processSubType)
                        : toTitleCase(process),
                });
                statusText = t('caseOverview.caseStatus.issued.badgeText');
            } else {
                statusVariant = BadgeVariant.SUCCESS;
                statusTooltip = `${t(
                    'caseOverview.caseStatus.completed.tooltip',
                    {
                        processSubType: processSubType
                            ? toTitleCase(processSubType)
                            : toTitleCase(process),
                    }
                )}${dayjs(updatedAt).format('MM/DD/YYYY')}.`;
                statusText = t('caseOverview.caseStatus.completed.badgeText');
            }
            break;
        case Statuses.NotStarted:
            statusVariant = BadgeVariant.DEFAULT;
            statusTooltip = t(
                'caseOverview.caseStatus.notStarted.statusTooltip'
            );
            statusText = t('caseOverview.caseStatus.notStarted.statusTooltip');
            break;
        case Statuses.Withdrawn:
            statusVariant = BadgeVariant.DEFAULT;
            statusTooltip = t('caseOverview.caseStatus.withdrawn.tooltip');
            statusText = t('caseOverview.caseStatus.withdrawn.badgeText');
            break;
        default:
            statusVariant = BadgeVariant.DEFAULT;
            statusTooltip = t('caseOverview.caseStatus.unknown.tooltip');
            statusText = t('caseOverview.caseStatus.unknown.badgeText');
            break;
    }

    return { statusTooltip, statusVariant, statusText };
};

export const CaseStatusTooltip = ({
    trigger,
    singleCase,
}: CaseStatusTooltipProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const statusTooltip = getStatusDetails({ singleCase, t }).statusTooltip;

    const caseIdValue =
        singleCase.id ??
        singleCase.identifiers?.find((i) => i.identifier === 'z1CaseId')
            ?.value ??
        singleCase.policyNumber;
    const tooltipId = generateTooltipId(caseIdValue);

    return (
        <Tooltip
            placement={TooltipPlacement.TopRight}
            tooltipClassName="!w-auto"
            triggerClassName="!z-10"
            trigger={cloneElement(trigger as ReactElement, {
                'aria-describedby': tooltipId,
            })}
        >
            {statusTooltip}
        </Tooltip>
    );
};
