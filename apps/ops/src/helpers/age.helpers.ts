import dayjs from 'dayjs';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

// Function to calculate age as a number
// Accepts either a Date object or a string in YYYY-MM-DD format
export const calculateAgeNumber = (
    birthday: string | Date | undefined | null
): number | undefined => {
    if (birthday === null || birthday === undefined) {
        return undefined;
    }

    // If Date object, format to YYYY-MM-DD string
    let birthdayString: string;
    if (birthday instanceof Date) {
        if (isNaN(birthday.getTime())) {
            return undefined;
        }
        birthdayString = dayjs(birthday).format(ZAHARA_API_DATE_FORMAT);
    } else {
        birthdayString = birthday;
    }

    // Validate the string format
    if (
        isNullEmptyOrUndefined(birthdayString) ||
        !dayjs(birthdayString, ZAHARA_API_DATE_FORMAT).isValid()
    ) {
        return undefined;
    }

    return dayjs().diff(dayjs(birthdayString, ZAHARA_API_DATE_FORMAT), 'year');
};
