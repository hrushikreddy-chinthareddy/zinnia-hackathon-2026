import dayjs from 'dayjs';
import { DEFAULT_ERROR_STRING } from './strings';

export const DEFAULT_DATE_FORMAT = 'M/D/YYYY';

/**
 *
 * @param date
 * @returns boolean
 * undefined is a valid dayjs date, so need to check specifically for date is null first
 */
export const isValidDate = (date: string | null | undefined) => {
  if (!date) {
    return false;
  }

  if (!dayjs(date).isValid()) {
    return false;
  }

  return true;
};

/**
 *
 * @param date
 * @returns format 2/26/2024
 */
export const standardDateMonthDayYear = (
  date: string | null | undefined
): string => {
  if (!isValidDate(date)) {
    return DEFAULT_ERROR_STRING;
  }

  return dayjs(date).format(DEFAULT_DATE_FORMAT);
};
