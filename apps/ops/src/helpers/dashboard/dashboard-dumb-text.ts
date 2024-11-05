import * as changeCase from 'change-case';

import { StatGroupingResponse } from '@deps/helpers/dashboard/types';
import { AgingTimeframes } from '@deps/models/case/case';

import { formatNumberLabel, wholeNumberFormatify } from '../numbers.helper';

export const getStatusSummaryDumbText = (caseStats: StatGroupingResponse) => {
    if (!caseStats || caseStats.count === 0) {
        return '';
    }

    const summary = `${wholeNumberFormatify(caseStats.count)} ${formatNumberLabel(
        'case',
        caseStats.count
    )} are currently opened. The distribution of the cases is `;

    const summaryAddition = caseStats.stats
        .slice(0, 5)
        .map(statGrouping => {
            return `${((statGrouping.count / caseStats.count) * 100).toLocaleString('en-us', {
                maximumFractionDigits: 0,
            })}% ${changeCase.capitalCase(statGrouping.label)}`;
        })
        .join(', ');

    return `${summary} ${summaryAddition}.`;
};

export const getCaseTypeSummaryDumbText = (caseStatGrouping: StatGroupingResponse) => {
    let summary = `${wholeNumberFormatify(caseStatGrouping?.count || 0)} ${formatNumberLabel(
        'case',
        caseStatGrouping?.count || 0
    )} are currently active. `;

    if (!caseStatGrouping || caseStatGrouping.count === 0) {
        return summary;
    }

    const sortedStats = caseStatGrouping.stats.sort((a, b) => b.count - a.count);
    const majorityCase = sortedStats.sort((a, b) => b.count - a.count)[0] || null;

    if (majorityCase) {
        summary += `Majority of the cases are ${changeCase.capitalCase(majorityCase.label)} with ${(
            (majorityCase.count / caseStatGrouping.count) *
            100
        ).toLocaleString('en-us', { maximumFractionDigits: 0 })}% of the cases. The remaining cases are distributed as `;
    }

    //loop through the case groupings and append to the summary
    sortedStats.slice(0, 5).forEach(caseStat => {
        const casePercent = (caseStat.count / caseStatGrouping.count) * 100;
        if (caseStat === majorityCase || casePercent < 1) {
            return;
        }
        summary += `${casePercent.toLocaleString('en-us', { maximumFractionDigits: 0 })}% ${changeCase.capitalCase(caseStat.label)}, `;
    });

    return summary;
};

const getAgingTimeFrameDisplayLabel = (agingTimeFrame: AgingTimeframes) => {
    switch (agingTimeFrame) {
        case AgingTimeframes.ThreeDays:
            return 'older than 3 days';
        case AgingTimeframes.FiveDays:
            return 'older than 5 days';
        case AgingTimeframes.SevenDays:
            return 'older than 7 days';
        case AgingTimeframes.FourteenDays:
            return 'older than 14 days';
        case AgingTimeframes.ThirtyDays:
            return 'older than 30 days';
        case AgingTimeframes.SixtyDays:
            return 'older than 60 days';
        case AgingTimeframes.NinetyDays:
            return 'older than 90 days';
        default:
            return agingTimeFrame;
    }
};
export const getAgingSummaryDumbText = (caseStatGrouping: StatGroupingResponse) => {
    let summary = `${wholeNumberFormatify(caseStatGrouping?.count || 0)} In Progress ${formatNumberLabel(
        'case',
        caseStatGrouping?.count || 0
    )} are considered to aging.
    The case distribution of the cases is `;

    if (!caseStatGrouping || caseStatGrouping.count === 0) {
        return summary;
    }

    //loop through the case groupings and append to the summary
    caseStatGrouping.stats
        .sort((a, b) => b.count - a.count)
        .forEach(caseStat => {
            summary += `${((caseStat.count / caseStatGrouping.count) * 100).toLocaleString('en-us', {
                maximumFractionDigits: 0,
            })}% ${getAgingTimeFrameDisplayLabel(caseStat.label as AgingTimeframes)}, `;
        });

    return summary;
};

export const getExceptionDistributionSummaryDumbText = (caseStatGrouping: StatGroupingResponse) => {
    let summary = `${caseStatGrouping?.count || 0} ${formatNumberLabel(
        'case',
        caseStatGrouping?.count || 0
    )} encountered exceptions. The top 5 exception categories are `;

    if (!caseStatGrouping || caseStatGrouping.count === 0) {
        return summary;
    }

    const top5Stats = caseStatGrouping.stats.sort((a, b) => b.count - a.count).slice(0, 5);

    //loop through the case groupings and append to the summary
    top5Stats.forEach(caseStat => {
        summary += `${((caseStat.count / caseStatGrouping.count) * 100).toLocaleString('en-us', {
            maximumFractionDigits: 0,
        })}% ${changeCase.capitalCase(caseStat.label)}, `;
    });

    return summary;
};
