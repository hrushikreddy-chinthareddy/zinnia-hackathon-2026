import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import {
    DEFAULT_DATETIME_DISPLAY_FORMAT,
    NUMERIC_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { browserLogWarn } from '@deps/utils/browser-logging';

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

/**
 * Formats a date from API format (YYYY-MM-DD) to picker format (MMDDYYYY).
 * If the date is invalid, logs a warning (if context provided) and returns empty string.
 *
 * @param date - The date string in ZAHARA_API_DATE_FORMAT (YYYY-MM-DD)
 * @param context - Optional context string for debugging (e.g., 'RMD DOB', 'Party DOB')
 * @returns Formatted date string in DATE_PICKER_FORMAT or empty string if invalid
 */
export const getFormattedDate = (
    date?: string | null,
    context?: string
): string => {
    if (!date) {
        return '';
    }

    const isValid = dayjs(date, ZAHARA_API_DATE_FORMAT).isValid();

    if (!isValid) {
        if (context) {
            browserLogWarn('getFormattedDate::Invalid date detected', {
                context,
                inputValue: date,
                expectedFormat: ZAHARA_API_DATE_FORMAT,
                timestamp: new Date().toISOString(),
            });
        }
        return '';
    }

    return dayjs(date, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT);
};

/**
 * Formats a date from picker format (MMDDYYYY) to API format (YYYY-MM-DD).
 * If the date is invalid, logs a warning (if context provided) and returns null.
 *
 * @param date - The date string in DATE_PICKER_FORMAT (MMDDYYYY)
 * @param context - Optional context string for debugging (e.g., 'RMD DOB', 'Party DOB')
 * @returns Formatted date string in ZAHARA_API_DATE_FORMAT or null if invalid
 */
export const getFormattedZaharaDate = (
    date?: string | null,
    context?: string
): string | null => {
    if (!date) {
        return null;
    }

    const isValid = dayjs(date, DATE_PICKER_FORMAT).isValid();

    if (!isValid) {
        if (context) {
            browserLogWarn('getFormattedZaharaDate::Invalid date detected', {
                context,
                inputValue: date,
                expectedFormat: DATE_PICKER_FORMAT,
                timestamp: new Date().toISOString(),
            });
        }
        return null;
    }

    return dayjs(date, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT);
};
