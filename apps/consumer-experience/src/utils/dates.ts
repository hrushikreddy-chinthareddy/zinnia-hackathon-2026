import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 *
 * @param date
 * @returns format 2/26/2024
 */
export const standardDateMonthYear = (date: string | null): string => {
  if (!dayjs(date).isValid()) {
    return DEFAULT_ERROR_STRING;
  }

  return dayjs(date).format('M/D/YYYY');
};

/**
 *
 * @param date
 *  @returns format 6/12/2023 5:00 pm EST
 */
export const dateMonthWithTimeEST = (date: string | null): string => {
  if (!dayjs(date).isValid()) {
    return DEFAULT_ERROR_STRING;
  }

  return dayjs(date).tz('America/New_York').format('M/D h:mm a EST');
};
