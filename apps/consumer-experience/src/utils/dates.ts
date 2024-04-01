import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
export const DEFAULT_DATE_FORMAT = 'M/D/YYYY';
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 *
 * @param date
 * @returns format 2/26/2024
 */
export const standardDateMonthYear = (
  date: string | null | undefined
): string => {
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

// Converts yyyy-mm-dd strings into m/d/yyyy
export const convertKebabedDateString = (date: string | undefined): string => {
  if (date === '' || date == null) {
    return DEFAULT_ERROR_STRING;
  }

  const [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return date;
  }
  return dayjs(date, 'MM-DD-YYYY').format(DEFAULT_DATE_FORMAT);
};
