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
