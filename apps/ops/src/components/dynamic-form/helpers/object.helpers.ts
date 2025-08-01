import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';

interface FormContextOptions {
    keyName: string;
    details: string;
    mainObject: string;
    minuend: string;
    subtrahend: string;
}

dayjs.extend(customParseFormat);

export const extractNestedData = (
    formContext: any,
    options: FormContextOptions
): { minuendData: string; subtrahendData: string } | null => {
    try {
        const data =
            formContext?.[options.keyName]?.[options.details]?.[
                options.mainObject
            ];

        if (!data) return null;

        const minuendData = data[options.minuend];
        const subtrahendData = data[options.subtrahend];

        if (!minuendData || !subtrahendData) return null;

        return {
            minuendData,
            subtrahendData,
        };
    } catch (error) {
        console.error('Error extracting nested data:', error);
        return null;
    }
};
export const calculateDifference = (
    formContext: any,
    options: FormContextOptions
): number | null => {
    const data = extractNestedData(formContext, options);
    if (!data) return null;

    const { minuendData, subtrahendData } = data;
    return Number(minuendData) - Number(subtrahendData);
};

export const filterNullAndUndefined = <T extends object>(
    obj: T
): Partial<T> => {
    // @TODO: Fix types and not cast as any
    const newObj: Partial<T> = {};
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        // If it's an array, filter out null/empty values and recursively clean elements
        const newArray = obj
            .map((item) => filterNullAndUndefined(item))
            .filter(
                (item) =>
                    !isNullEmptyOrUndefined(item) &&
                    Object.keys(item).length > 0
            );
        return newArray as any;
    }
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            // Recursively clean nested objects/arrays
            const cleanedValue = filterNullAndUndefined(value as any);

            // Add the property to the new object if it's not null, undefined, or an empty string
            if (!isNullEmptyOrUndefined(cleanedValue)) {
                if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
                    // Skip empty arrays
                    continue;
                }
                if (
                    typeof cleanedValue === 'object' &&
                    Object.keys(cleanedValue).length === 0
                ) {
                    // Skip empty objects
                    continue;
                }
                (newObj as any)[key] = cleanedValue;
            }
        }
    }
    return newObj as any;
};
