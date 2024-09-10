import dayjs from 'dayjs';

import { isNullEmptyOrUndefined } from  '@deps/helpers/string.helper';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ZAHARA_API_DATE_FORMAT} from '@deps/types/constants';

/**
 * Displays a party's age
 * @constructor
 * @param {number | null | undefined} age - The data value of the age.
 * @param {string} singularTranslation - The translation used if the age is singular (eg: 1 year old).
 * @param {string} pluralTranslation - The translation used if the age is plural. (eg: 2 years old)
 */
export const getDisplayAge = (age: number | null | undefined, singularTranslation: string, pluralTranslation: string): string => {
    if (age === null || age === undefined) {
        return DEFAULT_ERROR_STRING;
    }

    if (age === 0) {
        return '0';
    }

    return age === 1 ? singularTranslation : pluralTranslation;
};

// Function to calculate age as a number
export const calculateAgeNumber = (birthday: string | undefined): number | undefined => {
    if (isNullEmptyOrUndefined(birthday) || !dayjs(birthday, ZAHARA_API_DATE_FORMAT).isValid()) {
        return undefined;
    }
    return dayjs().diff(dayjs(birthday, ZAHARA_API_DATE_FORMAT), 'year');
};

