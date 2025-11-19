import { isNullEmptyOrUndefined } from './data';

export const DEFAULT_ERROR_STRING = '-';
export const DEFAULT_UNAVAILABLE_STRING =
  'This data is unavailable at this time. Please try again later.';
export const CONTACT_NUMBER = '1-800-232-2222';
export const EMAIL_REGEX =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+))\]/;
export const VALID_EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const toTitleCase = (value?: string | null): string => {
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

export function uncapitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toLocaleLowerCase() + String(val).slice(1);
}

export function convertToCamelCase(val: string, splitter = '_') {
  let tempArray = val.split(splitter);
  tempArray = tempArray.map(
    value =>
      value.charAt(0).toUpperCase() + value.toLowerCase().slice(1, value.length)
  );
  return uncapitalizeFirstLetter(tempArray.join(''));
}

export function capitalize(str: string | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

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

export const formatCurrencyLocal = (value: number | string): string => {
  const numberValue = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numberValue);
};

export const formatWithHash = (id: string) => {
  return `#${id}`;
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

/**
 * Returns the indefinite article for a given word.
 * This is a the most basic version of this rule and does not account
 * for the wacky exceptions like 'hotel' or acronyms
 *
 * @example
 * indefiniteArticle('elephant') // 'an'
 * indefiniteArticle('tiger') // 'a'
 *
 * @param {string} word - The word to get the indefinite article for
 * @returns {string} The indefinite article for the given word
 */
export const indefiniteArticle = (word?: string): string => {
  if (!word) {
    return '';
  }

  return word[0]?.match(/[aeiou]/i) ? 'an' : 'a';
};

export const formatPhoneNumber = (phoneNumber: string) => {
  const match = phoneNumber.match(/^(\+?\d{1,3})?(\d{3})?(\d{3})(\d{4})$/);

  if (!match) {
    return phoneNumber;
  }

  const [, countryCode, areaCode, restOfPhonePrefix, restOfPhoneSuffix] = match;

  const formattedPhone = [
    countryCode,
    areaCode,
    restOfPhonePrefix,
    restOfPhoneSuffix,
  ]
    .filter(Boolean)
    .join('-');

  return formattedPhone;
};

/**
 * Creates a query string from a variety of input types.
 *
 * @param {string | string[][] | Record<string, string> | URLSearchParams | undefined} obj -
 *   The input object to convert to a query string
 * @returns {string} The query string
 */
export const toQuerySearchParams = (
  obj:
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams
    | undefined
) => {
  return new URLSearchParams(obj).toString();
};
