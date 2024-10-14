import dayjs from 'dayjs';

interface DateRange {
    startDate?: string | undefined;
    endDate?: string | undefined;
}
type AnythingWithDates = Record<string, any> & DateRange;

export function isCurrentDated({ startDate, endDate }: AnythingWithDates): boolean {
    return isCurrentStartDate(startDate) && !isEndDated(endDate);
}

// Is the current date after the start date
export function isCurrentStartDate(startDate: string | undefined, treatNoStartAsCurrent: boolean = true): boolean {
    if (!startDate) return treatNoStartAsCurrent;
    return dayjs(startDate).isAfter(dayjs());
}

export function isEndDated(endDate: string | undefined): boolean {
    if (!endDate || dayjs(endDate).isAfter(dayjs())) return false;
    return true;
}
