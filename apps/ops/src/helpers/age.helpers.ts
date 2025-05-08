import dayjs from 'dayjs';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

// Function to calculate age as a number
export const calculateAgeNumber = (birthday: string | undefined): number | undefined => {
    if (isNullEmptyOrUndefined(birthday) || !dayjs(birthday, ZAHARA_API_DATE_FORMAT).isValid()) {
        return undefined;
    }
    return dayjs().diff(dayjs(birthday, ZAHARA_API_DATE_FORMAT), 'year');
};
