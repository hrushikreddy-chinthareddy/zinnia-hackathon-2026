import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';

import sampleData from './sample-data.json';

dayjs.extend(duration);

//TODO: Replace this with actual api spec when api publishes
export interface CaseTimingData {
    key: string;
    name: string;
    secondLow: number;
    secondMedian: number;
    secondMean: number;
    secondHigh: number;
    count: number;
}
//TODO: Implement the real query when its online
export const caseTimingQuery = async (
    _baseInsightQueryFilter: DashboardSearchFilter,
    _groupBy: GroupByOptions[]
): Promise<{ data: CaseTimingData[] }> => {
    const response = sampleData;
    if (!response?.data) {
        console.error(
            'createBaseQuery::An error occurred while getting case dashboard stats results',
            response?.data?.length,
            JSON.stringify(response)
        );
        throw response;
    } else {
        return response;
    }
};

export const getDaysFromSeconds = (seconds: number) => dayjs.duration(seconds, 'seconds').asDays();

export const getHoursFromSeconds = (seconds: number) => dayjs.duration(seconds, 'seconds').asHours();

export const generateSeries = (seriesData: CaseTimingData[]) => {
    return [
        {
            data: seriesData.map(item => {
                return {
                    name: item.name,
                    y: item.secondMedian,
                    count: item.count,
                };
            }),
        },
    ];
};

/**
 *
 * Creates tooltip for the case to close time chart.
 *
 * It reads the time value and formats it to hours if under 24 hours, else days
 */
export const generateTooltip = (tooltipVal: Highcharts.TooltipFormatterContextObject) => {
    // @ts-expect-error: this actually exists
    const count = tooltipVal.point.count;
    const name = tooltipVal.point.name;
    const hoursFromSeconds = getHoursFromSeconds(tooltipVal.y!);
    const daysFromSeconds = getDaysFromSeconds(tooltipVal.y!);
    const isOver24Hours = hoursFromSeconds > 24;

    return `<div>
                <span><b>&nbsp;${name}</b></span><br />
                <span>Median time: ${isOver24Hours ? daysFromSeconds.toFixed(1) : hoursFromSeconds.toFixed(1)} ${
        isOver24Hours ? 'day' : 'hour'
    }${count !== 1 ? 's' : ''}</span><br />
                <span>Total cases: ${count}</span>
            </div>`;
};

/**
 *
 * Formats the time value to hours if under 24 hours, else days
 */
export const generateLabel = (label: Highcharts.AxisLabelsFormatterContextObject, isSeriesShowingDays: boolean) => {
    const secondsNumber = Number(label.value);
    const hoursFromSeconds = getHoursFromSeconds(secondsNumber);
    const daysFromSeconds = getDaysFromSeconds(secondsNumber);
    const isOver24Hours = hoursFromSeconds > 24;
    const time = isOver24Hours ? daysFromSeconds.toFixed(0) : hoursFromSeconds.toFixed(0);

    return `${time} ${isOver24Hours || isSeriesShowingDays ? 'day' : 'hour'}${time !== '1' ? 's' : ''}`;
};
