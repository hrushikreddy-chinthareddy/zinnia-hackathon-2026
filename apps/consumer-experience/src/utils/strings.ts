export const DEFAULT_ERROR_STRING = '-';

export const toTitleCase = (value?: string): string => {
  if (!value) return '';

  return value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

export const toSentenceCase = (value?: string): string => {
  if (!value) {
    return '';
  }

  return value?.charAt(0)?.toUpperCase() + value?.slice(1)?.toLowerCase();
};

/**
 *
 * @param value
 * @returns default error string (-) if value is null otherwise returns value
 */
export function checkIfNull<T>(value: T): T | string {
  if (!value) {
    return '-'
  }

  return value;
}
