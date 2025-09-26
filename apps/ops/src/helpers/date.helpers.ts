import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import {
    DEFAULT_DATETIME_DISPLAY_FORMAT,
    NUMERIC_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';

export const ZAHARA_DATE_FORMAT = 'YYYY-MM-DD';
interface DateRange {
    startDate?: string | undefined;
    endDate?: string | undefined;
}
type AnythingWithDates = Record<string, any> & DateRange;

export function isCurrentDated({
    startDate,
    endDate,
}: AnythingWithDates): boolean {
    return isCurrentStartDate(startDate) && !isEndDated(endDate);
}

// Is the current date after the start date
export function isCurrentStartDate(
    startDate: string | undefined,
    treatNoStartAsCurrent: boolean = true
): boolean {
    if (!startDate) return treatNoStartAsCurrent;
    return dayjs(startDate).isAfter(dayjs());
}

export function isEndDated(endDate: string | undefined): boolean {
    if (!endDate || dayjs(endDate).isAfter(dayjs())) return false;
    return true;
}

export const getArrayIndexFromDate = (
    date: string,
    startDate: string,
    unitOfTime: 'month' | 'week' | 'day' = 'day'
): number => {
    const dateToStart = dayjs(startDate, 'YYYY-M-D').startOf(unitOfTime);

    return dayjs(date, 'YYYY-M-D').diff(dateToStart, unitOfTime);
};

export const getUtcDate = (
    effectiveDate: string,
    dateFormat: string = NUMERIC_DATE_FORMAT
): string | undefined => {
    dayjs.extend(utc);

    const now = dayjs();

    const dateWithTime = dayjs(effectiveDate, dateFormat)
        .set('hour', now.get('hour'))
        .set('minute', now.get('minute'))
        .set('second', now.get('second'));

    return dayjs(dateWithTime).utc().format(ZAHARA_API_DATE_FORMAT);
};

export function convertToUserTimezone(
    dateTime: string,
    format: string = DEFAULT_DATETIME_DISPLAY_FORMAT
) {
    const userTz = dayjs.tz.guess();

    const localTime = dayjs.utc(dateTime).tz(userTz);
    return `${localTime.format(format)} ${localTime.format('Z')}`;
}
