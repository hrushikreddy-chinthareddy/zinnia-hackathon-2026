import { isEndDated } from '@deps/helpers/date.helpers';
import {
    Address,
    BankAccount,
    Email,
    Phone,
} from '@zinnia/api-types/types/sor';

export const filterPastEndDate = (
    list: (Address | Phone | Email | BankAccount)[] | undefined
) => {
    if (!list) return [];
    return list.filter((el) => !isEndDated(el?.endDate));
};
