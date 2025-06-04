import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { DEFAULT_ERROR_STRING } from './strings';

export const DEFAULT_DATE_FORMAT = 'M/D/YYYY';
export const ENTERPRISE_DATE_FORMAT = 'YYYY-MM-DD';
export const ASIA_IN_TZ = 'Asia/Calcutta';
export const ASIA_IN_LOCAL = 'en-IN';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

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


const getUserLocale = (): string => {
  const formatter = new Intl.DateTimeFormat();
  const resolvedOptions = formatter.resolvedOptions();
  console.log('Resolved options:', resolvedOptions);
  if (resolvedOptions.timeZone === ASIA_IN_TZ) {
    return ASIA_IN_LOCAL;
  }
  return resolvedOptions.locale;
}

export const formatTimestamp = (
  timestamp: string,
  style: 'standard' | 'tooltip' | 'monthDay' | 'dateTimeWithTZ' = 'standard'
): string => {
  const parsedTime = dayjs(timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ');

  if (!parsedTime.isValid()) {
    return DEFAULT_ERROR_STRING;
  }

  const timeZone = dayjs.tz.guess();
  const localizedTime = parsedTime.tz(timeZone);
  const locale = getUserLocale();
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName: 'short',
  });

  const parts = formatter.formatToParts(new Date(localizedTime.format()));
  const timeZoneAbbr = parts.find(part => part.type === 'timeZoneName')?.value || '';

  switch (style) {
    case 'standard':
      return localizedTime.format(`M/D/YYYY [at] h:mma [${timeZoneAbbr}]`);

    case 'tooltip':
      return localizedTime.format(`MMM D, YYYY [at] h:mma [${timeZoneAbbr}]`);

    case 'monthDay': {
      const currentYear = dayjs().year();
      const base = localizedTime.format('MMM D');
      return currentYear === localizedTime.year()
        ? base
        : `${base}, ${localizedTime.year()}`;
    }

    case 'dateTimeWithTZ':
      return localizedTime.format(`M/D/YYYY [at] h:mm a [${timeZoneAbbr}]`);

    default:
      return localizedTime.format(DEFAULT_DATE_FORMAT);
  }
};

