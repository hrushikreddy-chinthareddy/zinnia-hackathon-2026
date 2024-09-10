import dayjs from 'dayjs';

export function isEndDated(endDate: string | undefined): boolean {
    if (!endDate || dayjs(endDate).isAfter(dayjs())) return false;
    return true;
}
