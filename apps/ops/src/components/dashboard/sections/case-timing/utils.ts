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

export const getMinutesFromSeconds = (seconds: number) => dayjs.duration(seconds, 'seconds').asMinutes();

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

/**
 *
 * Formats the timespan for the table view.
 * If longer than 24 hours, show days,
 * if less than 24 hours, show hours, if less than 1 hour, show minutes, if less than 1 minute, show seconds
 */
export const generateTableTimeRange = (seconds: number) => {
    const hours = getHoursFromSeconds(seconds);
    const days = getDaysFromSeconds(seconds);
    const minutes = getMinutesFromSeconds(seconds);

    const isLongerThan24Hours = hours > 24;
    const isLessThanOneHour = minutes < 60;
    const isLessThanOneMinute = seconds < 60;

    let time;
    let unit;

    if (isLongerThan24Hours) {
        time = days.toFixed(1);
        unit = 'day';
    } else if (isLessThanOneMinute) {
        time = seconds;
        unit = 'second';
    } else if (isLessThanOneHour) {
        time = minutes.toFixed(1);
        unit = 'minute';
    } else {
        time = hours.toFixed(1);
        unit = 'hour';
    }

    return `${+time} ${unit}${time !== '1' ? 's' : ''}`;
};
