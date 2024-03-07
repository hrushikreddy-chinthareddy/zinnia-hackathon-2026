export const DEFAULT_ERROR_STRING = '-';
export const DEFAULT_UNAVAILABLE_STRING =
  'This data is unavailable at this time. Please try again later.';

export const toTitleCase = (value?: string): string => {
  if (!value) return '';

  return value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

export const toSentenceCase = (value?: string): string => {
  if (!value) {
    return DEFAULT_ERROR_STRING;
  }

  return value?.charAt(0)?.toUpperCase() + value?.slice(1)?.toLowerCase();
};
