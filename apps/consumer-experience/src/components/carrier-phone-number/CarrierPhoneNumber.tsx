'use client';

import Cookies from 'js-cookie';

import { Link } from '@/components/link/Link';
import { useIsClient } from '@/hooks/use-is-client';
import { CompanyName } from '@/types/carriers';
import { THEME_COOKIE } from '@/utils/serverClientUtils';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

export const EVERLY_CONTACT_PHONE_NUMBER = '1-855-290-0529';
export const WELLABE_CONTACT_PHONE_NUMBER = '1-888-222-3003';
export const FARMERS_CONTACT_PHONE_NUMBER = '1-800-238-9671';
export const EVERGLADES_CONTACT_PHONE_NUMBER = '1-881-330-8004';

const phoneByCarrier = (name?: CompanyName | string) => {
  switch (name?.toLowerCase()) {
    case CompanyName.EVERLY:
      return EVERLY_CONTACT_PHONE_NUMBER;
    case CompanyName.WELLABE:
      return WELLABE_CONTACT_PHONE_NUMBER;
    case CompanyName.FARMERS:
      return FARMERS_CONTACT_PHONE_NUMBER;
    case CompanyName.EVERGLADES:
      return EVERGLADES_CONTACT_PHONE_NUMBER;
    default:
      '';
  }
};

export const CarrierPhoneNumber = () => {
  const isClient = useIsClient();

  const currentTheme = Cookies.get(THEME_COOKIE);

  let phoneNumber = phoneByCarrier(currentTheme);
  let href: string | undefined = `tel:${phoneNumber}`;

  if (!isClient || !phoneNumber || phoneNumber.length < 1) {
    phoneNumber = DEFAULT_ERROR_STRING;
    href = undefined;
  }

  return (
    <Link isNativeAnchorTag href={href}>
      {phoneNumber}
    </Link>
  );
};
