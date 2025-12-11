import get from 'lodash/get';

/**
 * Returns an array with the readable names of missing fields of an object
 * Validate required paths, considering external system may omit fields or return blank values
 */
export const validateRequiredFields = (
    object: any,
    requiredFieldsPathArray: Record<string, string>
) =>
    Object.entries(requiredFieldsPathArray)
        .filter(([path]) => {
            const value = get(object, path);
            return value === null || value === undefined || value === '';
        })
        .map(([, label]) => label);
