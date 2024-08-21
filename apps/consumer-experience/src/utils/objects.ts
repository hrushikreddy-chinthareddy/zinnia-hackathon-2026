export const areAllValuesNull = (obj: object) => {
  return Object.values(obj).every(value => value === null);
};

export const returnNonNullValues = (obj: object) => {
  return Object.values(obj).filter(value => value !== null);
};

/**
 * Recursively searches for a property name in an object and returns the value of that property.
 *
 * @param {O} obj - The object to search in.
 * @param {string} propertyName - The property name to search for.
 * @return {T | undefined} The value of the property, or undefined if not found.
 */
export function findPropertyValue<O, T>(
  obj: O,
  propertyName: string
): T | undefined {
  for (const key in obj) {
    if (key === propertyName) {
      return obj[key] as T;
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const value = findPropertyValue(obj[key], propertyName);
      if (value !== undefined) {
        return value as T;
      }
    }
  }

  return undefined;
}
