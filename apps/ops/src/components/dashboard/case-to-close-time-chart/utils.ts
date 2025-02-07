import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { CaseTimingData } from '@deps/queries/api/cases';

dayjs.extend(duration);

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

export const getDaysFromSeconds = (seconds: number) => dayjs.duration(seconds, 'seconds').asDays();

export const getHoursFromSeconds = (seconds: number) => dayjs.duration(seconds, 'seconds').asHours();

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
