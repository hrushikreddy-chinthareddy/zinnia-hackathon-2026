import dayjs from 'dayjs';
import { DEFAULT_ERROR_STRING } from './strings';

export const DEFAULT_DATE_FORMAT = 'M/D/YYYY';
export const ENTERPRISE_DATE_FORMAT = 'YYYY-MM-DD';

/**
 *
 * @param date
 * @returns boolean
 * undefined is a valid dayjs date, so need to check specifically for date is null first
 */
export const isValidDate = (date: string | Date | null | undefined) => {
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
  date: string | Date | null | undefined
): string => {
  if (!isValidDate(date)) {
    return DEFAULT_ERROR_STRING;
  }

  return dayjs(date).format(DEFAULT_DATE_FORMAT);
};

export const toEnterpriseDate = (date: string | Date | null | undefined) => {
  if (!isValidDate(date)) {
    return DEFAULT_ERROR_STRING;
  }

  return dayjs(date).format(ENTERPRISE_DATE_FORMAT);
};

/**
 * Calculate the number of years left until a given duration is completed.
 *
 * @param startDate - The start date in ISO string format
 * @param duration - The duration in years
 * @returns The number of years left until the duration is completed
 */
export const yearsLeft = (
  startDate: string | undefined | null,
  duration: number | undefined | null
): number => {
  if (!startDate || !duration) {
    return 0;
  }
  const start = new Date(startDate);
  const now = new Date();

  let elapsedYears = now.getFullYear() - start.getFullYear();

  // Adjust the year calculation depending on which month we are in
  if (
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
  ) {
    elapsedYears--;
  }

  const yearsLeft = duration - elapsedYears;
  return yearsLeft > 0 ? yearsLeft : 0;
};
