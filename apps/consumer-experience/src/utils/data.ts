import dayjs from 'dayjs';

import { Phone } from '@/components/person-data/types';

/**
 *
 * @param endDate
 * @returns Boolean -
 * In Zahara an end date in the past is equivalent to item deletion
 */
export function isEndDatedAndEndDateUpcoming(endDate: string): boolean {
  // If there's no end date (it's a forever thing)
  // OR the end date is in the future so the value is upcoming, return false
  // this is really more like isEndDatedAndEndDateUpcoming
  if (!endDate || dayjs(endDate).isAfter(dayjs())) {
    return false;
  }

  return true;
}

export function formatPhoneNumberWithExtension(phone: Phone): string {
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
}
