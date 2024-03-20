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
