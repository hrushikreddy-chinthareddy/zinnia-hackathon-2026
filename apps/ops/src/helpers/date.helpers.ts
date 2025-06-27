import dayjs from 'dayjs';

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
