import {
    Address,
    BankAccount,
    Email,
    Phone,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { isEndDated } from '@deps/helpers/date.helpers';

export const filterPastEndDate = (
    list: (Address | Phone | Email | BankAccount)[] | undefined
) => {
    if (!list) return [];
    return list.filter((el) => !isEndDated(el?.endDate));
};
