import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { numberWithOrdinal } from './numbers';
import { DEFAULT_ERROR_STRING } from './strings';
export const DEFAULT_DATE_FORMAT = 'M/D/YYYY';
export const ZAHARA_DATE_FORMAT = 'YYYY-MM-DD';
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

export const toEnterpriseDate = (date: string | null | undefined) => {
  if (!isValidDate(date)) {
    return DEFAULT_ERROR_STRING;
  }

  return dayjs(date).format(ENTERPRISE_DATE_FORMAT);
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

/**
 * Pass in a day of a month. It returns the next instance of that day of the month.
 *
 * For instance, if today is 8.20.2024 and you pass in '10' it will return 9.10.2024
 * @param dayToAdd
 * @returns
 */
export const getNextOccurrenceOfDay = (dayToAdd?: number | null) => {
  if (!dayToAdd) {
    return DEFAULT_ERROR_STRING;
  }
  const today = dayjs();
  const date =
    today.date() > dayToAdd
      ? today.add(1, 'month').date(dayToAdd)
      : today.date(dayToAdd);

  return date.format(DEFAULT_DATE_FORMAT);
};

export const sortByDate = (
  a: string | null | undefined,
  b: string | null | undefined,
  options: {
    order: 'asc' | 'desc';
  }
) => {
  const order = options.order;

  const aIsNull = a == null;
  const bIsNull = b == null;

  if (aIsNull && bIsNull) {
    return 0;
  }
  if (aIsNull) {
    return 1;
  }
  if (bIsNull) {
    return -1;
  }

  return order === 'asc'
    ? dayjs(a).isBefore(dayjs(b))
      ? -1
      : 1
    : dayjs(a).isAfter(dayjs(b))
      ? -1
      : 1;
};

export const getUserLocale = (): string => {
  const formatter = new Intl.DateTimeFormat();
  const resolvedOptions = formatter.resolvedOptions();
  if (resolvedOptions.timeZone === ASIA_IN_TZ) {
    return ASIA_IN_LOCAL;
  }
  return resolvedOptions.locale;
};

/**
 * Formats date and time in the user's current timezone.
 * Example output: 11/13/2025 at 6:00 pm EST
 */
export const formatDateWithUserTimezone = (date: Date): string => {
  const parsedTime = dayjs(date);
  const timeZone = dayjs.tz.guess();
  const locale = getUserLocale();

  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName: 'short',
  });

  const parts = formatter.formatToParts(
    new Date(parsedTime.tz(timeZone).format())
  );
  const timeZoneAbbr =
    parts.find(part => part.type === 'timeZoneName')?.value || '';

  return `${parsedTime
    .tz(timeZone)
    .format(`${DEFAULT_DATE_FORMAT} [at] h:mm a`)} ${timeZoneAbbr}`;
};
/**
 * Checks whether a given end date is in the past or undefined.
 *
 * @param endDate - The end date string to evaluate.
 * @returns `true` if the date is before today, otherwise `false`.
 *
 * @example
 * ```ts
 * isEndDated('2024-12-01'); // true if that date is in the past
 * isEndDated(undefined); // false
 * ```
 */
export function isEndDated(endDate: string | undefined): boolean {
  if (!endDate || dayjs(endDate).isAfter(dayjs())) return false;
  return true;
}

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

  if (
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
  ) {
    elapsedYears--;
  }

  const yearsLeft = duration - elapsedYears;
  return yearsLeft > 0 ? yearsLeft : 0;
};

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
  const timeZoneAbbr =
    parts.find(part => part.type === 'timeZoneName')?.value || '';

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

export const formatRelativeTime = (
  inputDate: Date | string | number | undefined
): string => {
  if (!inputDate) {
    return DEFAULT_ERROR_STRING;
  }

  const now = dayjs();
  const target = dayjs(inputDate);

  const diffInMinutes = now.diff(target, 'minute');
  const diffInHours = now.diff(target, 'hour');
  const diffInDays = now.diff(target, 'day');

  if (diffInMinutes < 1) {
    return 'just now';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
};

export const startOfTomorrowLocalIso = (ymd: string) => {
  const base = dayjs(ymd);
  if (!base.isValid()) return DEFAULT_ERROR_STRING;

  return base.add(1, 'day').startOf('day').toDate().toISOString();
};

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  let formatted = date.toLocaleString('en-US', options);

  formatted = formatted
    .replace('at ', '')
    .replace(' PM', ' pm')
    .replace(' AM', ' am');

  return formatted;
}
