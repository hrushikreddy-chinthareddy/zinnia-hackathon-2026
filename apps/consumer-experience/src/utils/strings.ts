import { isNullEmptyOrUndefined } from './data';

export const DEFAULT_ERROR_STRING = '-';
export const DEFAULT_UNAVAILABLE_STRING =
  'This data is unavailable at this time. Please try again later.';
export const CONTACT_NUMBER = '1-800-232-2222';
export const EMAIL_REGEX =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const toTitleCase = (value?: string): string => {
  if (!value) return '';

  return value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

export const toSentenceCase = (value?: string | null): string => {
  if (!value) {
    return DEFAULT_ERROR_STRING;
  }

  return value?.charAt(0)?.toUpperCase() + value?.slice(1)?.toLowerCase();
};

// Format SSN return 1234
export const formatSsn = (ssn?: string): string => {
  if (!ssn) {
    return DEFAULT_ERROR_STRING;
  }

  // Remove any non-numeric characters
  const cleanedSSN = ssn.replace(/\D/g, '');

  // Get the last 4 digits
  const last4Digits = cleanedSSN.slice(-4);

  // Append the last 4 digits to the static string
  return last4Digits;
};

export const pluralize = (
  quantity?: number | null,
  word?: string | null,
  wordOnly?: boolean
): string => {
  if (!word || isNullEmptyOrUndefined(quantity)) {
    return DEFAULT_ERROR_STRING;
  }

  const pluralizedVal = quantity === 1 ? word : `${word}s`;

  if (wordOnly) {
    return pluralizedVal;
  }

  return `${quantity} ${pluralizedVal}`;
};

/**
 * Creates a query string from an object.
 *
 * @example
 * const obj = { foo: 'bar', baz: 'qux' };
 * const queryString = createQueryString(obj);
 * // queryString = 'foo=bar&baz=qux'
 *
 * @param {Record<string, unknown>} obj - The object to convert to a query string
 * @returns {string} The query string
 */
export const createQueryString = (obj: Record<string, unknown>) =>
  Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
