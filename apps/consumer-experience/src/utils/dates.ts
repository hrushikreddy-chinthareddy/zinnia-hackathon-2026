import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { numberWithOrdinal } from './numbers';
export const DEFAULT_DATE_FORMAT = 'M/D/YYYY';
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 *
 * @param date
 * @returns boolean
 * undefined is a valid dayjs date, so need to check specifically for date is null first
 */
const isValidDate = (date: string | null | undefined) => {
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

/**
 *
 * @param date
 *  @returns format 6/12/2023 5:00 pm EST
 */
export const standardDateWithTimeEST = (date: string | null): string => {
  if (!isValidDate(date)) {
    return DEFAULT_ERROR_STRING;
  }

  return dayjs(date)
    .tz('America/New_York')
    .format(`${DEFAULT_DATE_FORMAT} h:mm a EST`);
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

export const dayOfMonthWithOrdinal = (
  date: string | undefined | null
): string => {
  if (!isValidDate(date)) {
    return DEFAULT_ERROR_STRING;
  }

  return numberWithOrdinal(dayjs(date).get('date'));
};
