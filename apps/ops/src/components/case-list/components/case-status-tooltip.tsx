import { BadgeVariant, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { toTitleCase } from '@deps/helpers/string.helper';
import { Case, Statuses } from '@deps/models/case/case';

interface GetStatusDetailsProps {
    singleCase: Case;
    t: TFunction;
}

interface CaseStatusTooltipProps {
    trigger: ReactNode;
    singleCase: Case;
}

export const getStatusDetails = ({ singleCase, t }: GetStatusDetailsProps) => {
    const { caseStatus, processSubType, process, createdAt, exceptions, updatedAt } = singleCase;
    const daysAgo = calculateDaysAgo(new Date(singleCase.createdAt));

    let statusTooltip = '';
    let statusVariant = '';
    let statusText = '';

    switch (caseStatus) {
        case Statuses.InProgress:
            statusVariant = BadgeVariant.INFO;
            statusTooltip = `${t('caseOverview.caseStatus.inProgress.tooltip', {
                processSubType: processSubType ? toTitleCase(processSubType) : toTitleCase(process),
            })}${dayjs(createdAt).format('MM/DD/YYYY')}${t('caseOverview.caseStatus.inProgress.tooltip2', {
                daysAgo: daysAgo,
            })}`;
            statusText = t('caseOverview.caseStatus.inProgress.badgeText');
            break;

        case Statuses.Exception:
            statusVariant = BadgeVariant.ERROR;
            if (exceptions.length !== 0) {
                statusTooltip = `${t('caseOverview.caseStatus.exception.tooltip', {
                    processSubType: processSubType ? toTitleCase(processSubType) : toTitleCase(process),
                })}${t('caseOverview.caseStatus.exception.tooltip2', { exceptions: exceptions.length })}`;
            } else {
                statusTooltip = t('caseOverview.caseStatus.zeroException.tooltip', {
                    requestSubType: processSubType ? toTitleCase(processSubType) : toTitleCase(process),
                });
            }
            statusText = t('caseOverview.caseStatus.exception.badgeText');
            break;

        case Statuses.Canceled:
            statusVariant = BadgeVariant.INACTIVE;
            statusTooltip = `${t('caseOverview.caseStatus.canceled.tooltip', {
                processSubType: processSubType ? toTitleCase(processSubType) : toTitleCase(process),
            })}${dayjs(updatedAt).format('MM/DD/YYYY')}.`;
            statusText = t('caseOverview.caseStatus.canceled.badgeText');
            break;

        case Statuses.Completed:
            statusVariant = BadgeVariant.SUCCESS;
            statusTooltip = `${t('caseOverview.caseStatus.completed.tooltip', {
                processSubType: processSubType ? toTitleCase(processSubType) : toTitleCase(process),
            })}${dayjs(updatedAt).format('MM/DD/YYYY')}.`;
            statusText = t('caseOverview.caseStatus.completed.badgeText');
            break;
        case Statuses.NotStarted:
            statusVariant = BadgeVariant.DEFAULT;
            statusTooltip = t('caseOverview.caseStatus.notStarted.statusTooltip');
            statusText = t('caseOverview.caseStatus.notStarted.statusTooltip');
            break;
        default:
            statusVariant = BadgeVariant.DEFAULT;
            statusTooltip = t('caseOverview.caseStatus.unknown.tooltip');
            statusText = t('caseOverview.caseStatus.unknown.badgeText');
            break;
    }

    return { statusTooltip, statusVariant, statusText };
};

export const CaseStatusTooltip = ({ trigger, singleCase }: CaseStatusTooltipProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const statusTooltip = getStatusDetails({ singleCase, t }).statusTooltip;

    return (
        <Tooltip placement={TooltipPlacement.TopRight} tooltipClassName="!w-auto" triggerClassName="!z-10" trigger={trigger}>
            {statusTooltip}
        </Tooltip>
    );
};
