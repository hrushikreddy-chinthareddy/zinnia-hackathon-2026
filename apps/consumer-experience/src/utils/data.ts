import dayjs from 'dayjs';

import { Phone } from '@/components/person-data/types';

export function isEndDated(endDate: string): boolean {
  if (!endDate || dayjs(endDate).isAfter(dayjs())) return false;
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
