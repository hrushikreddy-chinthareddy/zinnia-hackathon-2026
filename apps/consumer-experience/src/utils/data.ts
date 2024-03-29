import { Address, Email, Phone } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { DEFAULT_ERROR_STRING, toSentenceCase } from './strings';

/**
 *
 * @param endDate
 * @returns Boolean -
 * In Zahara an end date in the past is equivalent to item deletion
 */
export const isEndDatedAndEndDateUpcoming = (
  endDate?: string | null
): boolean => {
  // If there's no end date (it's a forever thing)
  // OR the end date is in the future so the value is upcoming, return false
  // this is really more like isEndDatedAndEndDateUpcoming
  if (!endDate || dayjs(endDate).isAfter(dayjs())) {
    return false;
  }

  return true;
};

export type ItemsWithEndDate = Address | Email | Phone;

export const filterItemsWithPastEndDate = (
  items?: ItemsWithEndDate[]
): ItemsWithEndDate[] => {
  if (!items) {
    return [];
  }
  return items?.filter(item => !isEndDatedAndEndDateUpcoming(item?.endDate));
};

export const formatPhoneNumberWithExtension = (phone: Phone): string => {
  let formattedNumber = '';
  if (phone.countryCode) {
    formattedNumber += `+${phone.countryCode}`;
  }
  if (phone.areaCode) {
    formattedNumber += ` (${phone.areaCode}) `;
  }
  if (phone.dialNumber) {
    formattedNumber += `${phone.dialNumber.substring(0, 3)}-${phone.dialNumber.substring(3, 8)}`;
  }
  if (phone.extension) {
    formattedNumber += ` ext. ${phone.extension}`;
  }
  return formattedNumber;
};

// TODO: confirm this error handling
export const fullName = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  return !firstName && !lastName
    ? DEFAULT_ERROR_STRING
    : `${toSentenceCase(firstName)} ${toSentenceCase(lastName)}`;
};

// TODO: should this return 0? or have a prop for displaying 0 if 0 is not null?
/**
 *
 * @param value
 * @returns default error string (-) if value is null otherwise returns value
 */
export const checkIfNull = <T>(value: T, zeroIsValid?: boolean): T | string => {
  if (!zeroIsValid && !value) {
    return DEFAULT_ERROR_STRING;
  }

  if (zeroIsValid && isNullEmptyOrUndefined(value)) {
    return DEFAULT_ERROR_STRING;
  }

  return value;
};

export const isNullEmptyOrUndefined = <T>(value: T): boolean => {
  return value === null || value === undefined || value === '';
};

export const bankAccountNumberSanitizer = (
  accountNum?: string | null
): string | undefined => {
  if (!accountNum) {
    return undefined;
  }

  // This seems like an extreme edge case, but should probably add some better handling here
  if (accountNum.length <= 4) {
    return accountNum.slice(-3);
  }

  return accountNum.slice(-4);
};
