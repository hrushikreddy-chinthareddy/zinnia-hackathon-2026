import dayjs from 'dayjs';
import Image from 'next/image';
import { useTranslation, TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';

import { parseAndFormatDate, toSentenceCase } from '@deps/helpers/string.helpers';
import { Statuses } from '@deps/models/case/case';
import InProgressIcon from '@deps/styles/elements/icons/alert/in-progress.svg';
import NotStartedIcon from '@deps/styles/elements/icons/alert/not-started.svg';
import AlertExclamationIcon from '@deps/styles/elements/icons/alert/status-alert-exclamation.svg';
import CheckmarkIcon from '@deps/styles/elements/icons/icons_outlined/status-checkmark.svg';

export const getStatusIcon = (t: TFunction, status: Statuses | undefined, width?: number, height?: number) => {
    switch (status) {
        case Statuses.Exception:
            return (
                <Image src={AlertExclamationIcon} alt={t('status.exception')} width={width ? width : 20} height={height ? height : 20} />
            );
        case Statuses.InProgress:
            return (
                <Image
                    src={InProgressIcon}
                    alt={t('status.inProgress')}
                    width={width ? width : 20}
                    height={height ? height : 20}
                    className="p-0.5"
                />
            );
        case Statuses.Completed:
            return <Image src={CheckmarkIcon} alt={t('status.completed')} width={width ? width : 17} height={height ? height : 17} />;
        default:
            return (
                <Image
                    src={NotStartedIcon}
                    alt={t('status.notStarted')}
                    width={width ? width : 16}
                    height={height ? height : 16}
                    className="text-gray-300"
                />
            );
    }
};

export const getStatusAccentColor = (status: Statuses | undefined) => {
    switch (status) {
        case Statuses.Exception:
            return 'semantic-error';
        case Statuses.InProgress:
            return 'semantic-info';
        case Statuses.Completed:
            return 'semantic-success';
        default:
            return 'gray-600';
    }
};

export const getStatusData = (t: TFunction, status: Statuses | undefined, reason: string, detailedReason = '') => {
    const reasonSentence = toSentenceCase(reason);
    const detailedReasonSentence = toSentenceCase(detailedReason);
    const detailedReasonText = `${reasonSentence ? `${reasonSentence}.` : ''}${
        detailedReasonSentence ? ` ${detailedReasonSentence}.` : ''
    }`;

    switch (status) {
        case Statuses.Exception:
            return {
                accentColor: getStatusAccentColor(status),
                statusIcon: getStatusIcon(t, status),
                reasonText: t('caseOverview.caseStatus.exception.reason'),
                detailedReasonText,
            };
        case Statuses.InProgress: {
            return {
                accentColor: getStatusAccentColor(status),
                statusIcon: getStatusIcon(t, status),
                reasonText: t('caseOverview.caseStatus.inProgress.reason'),
                detailedReasonText,
            };
        }
        case Statuses.Completed:
            return {
                accentColor: getStatusAccentColor(status),
                statusIcon: getStatusIcon(t, status),
                reasonText: t('caseOverview.caseStatus.completed.reason'),
                detailedReasonText,
            };
        default: {
            return {
                accentColor: getStatusAccentColor(status),
                statusIcon: getStatusIcon(t, status),
                reasonText: t('caseOverview.caseStatus.notStarted.reason'),
                detailedReasonText,
            };
        }
    }
};

export const getTimeAgoUnitValue = (date: string): { unit: string; count: number } | null => {
    const today = new Date();
    const lastUpdatedDate = new Date(date);

    if (!today || !lastUpdatedDate || !date) return null;

    const monthsAgo = dayjs().diff(dayjs(date), 'months');
    const weeksAgo = dayjs().diff(dayjs(date), 'weeks');
    const daysAgo = dayjs().diff(dayjs(date), 'days');
    const hoursAgo = dayjs().diff(dayjs(date), 'hours');
    const minutesAgo = dayjs().diff(dayjs(date), 'minutes');

    let unit = 'month';
    let count = monthsAgo;
    if (monthsAgo < 1) {
        unit = 'week';
        count = weeksAgo;
        if (weeksAgo < 1) {
            unit = 'day';
            count = daysAgo;
            if (daysAgo < 1) {
                unit = 'hour';
                count = hoursAgo;

                if (hoursAgo < 1) {
                    unit = 'minute';
                    count = minutesAgo;
                }
            }
        }
    }

    return { unit, count };
};

export const useTimestampText = (t: TFunction, date: string) => {
    const [today, setToday] = useState<Date | null>(null);
    const [lastUpdatedDate, setLastUpdateDate] = useState<Date | null>(null);

    useEffect(() => {
        setToday(new Date());
        setLastUpdateDate(new Date(date));
    }, [date]);

    if (!today || !lastUpdatedDate || !date) return '';

    const formattedDate = parseAndFormatDate('YYYY-MM-DDTHH:mm:ssZ[Z]', 'M/D/YY h:mm a', date) as string;
    const key = 'temporal.timeago';
    const { unit, count } = getTimeAgoUnitValue(date) || {};

    return t(key, { formattedDate, count, unit });
};

export const useStatusInfo = (status: Statuses | undefined, updatedAt: string, reason: string, detailedReason = '') => {
    const { t } = useTranslation();

    const { accentColor, statusIcon, reasonText, detailedReasonText } = getStatusData(t, status, reason, detailedReason);
    const updatedText = toSentenceCase(t('temporal.lastUpdated') + ' ' + useTimestampText(t, updatedAt));

    const iconClassNames = `w-8 h-8 rounded-full border-2 border-${accentColor} flex items-center justify-center flex-shrink-0`;
    const reasonClassNames = `text-${accentColor} font-primary font-semibold text-base`;

    return {
        statusIcon,
        iconClassNames,
        reasonClassNames,
        updatedText,
        reasonText,
        detailedReasonText,
    };
};
