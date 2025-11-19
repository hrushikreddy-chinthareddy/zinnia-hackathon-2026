export const zipCodeInParts = (postalCode?: string) => {
  if (!postalCode) {
    return {};
  }

  // This is extra extra precaution. The input field should prevent spaces.
  const trimmedPostalCode = postalCode.trim();

  return {
    zipCode: trimmedPostalCode.split('-')[0],
    extension: trimmedPostalCode.split('-')[1] || undefined,
  };
};

/**
 * This function maps an ISO 3166-1 alpha-2
 * 2 digit country such as "US" to its
 * full country name such as "United States".
 */
export const countryCodeMap: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  IN: 'India',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
};

export const countryCodeToName = (code?: string): string => {
  let result = 'Unknown Country';
  if (code?.length) {
    const countryName = countryCodeMap[code.toUpperCase()];
    if (countryName) {
      result = countryName;
    }
  }
  return result;
};
