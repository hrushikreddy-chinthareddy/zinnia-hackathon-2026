'use client';

import Cookies from 'js-cookie';

import { CompanyName } from '@/types/carriers';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

export const EVERLY_CONTACT_PHONE_NUMBER = '1-855-290-0529';
export const WELLABE_CONTACT_PHONE_NUMBER = '1-888-222-3003';

const phoneByCarrier = (name?: CompanyName | string) => {
  switch (name?.toLowerCase()) {
    case CompanyName.EVERLY:
      return EVERLY_CONTACT_PHONE_NUMBER;
    case CompanyName.WELLABE:
      return WELLABE_CONTACT_PHONE_NUMBER;
    default:
      '';
  }
};

export const CarrierPhoneNumber = () => {
  const currentTheme = Cookies.get(THEME_COOKIE);

  return (
    <a href={`tel:+${phoneByCarrier(currentTheme)}`}>
      {phoneByCarrier(currentTheme)}
    </a>
  );
};
