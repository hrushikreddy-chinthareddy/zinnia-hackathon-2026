'use client';

import { useIsClient } from '@xd-components/hooks/useIsClient';
import Cookies from 'js-cookie';

import { Link } from '@/components/link/Link';
import { CompanyName } from '@/types/carriers';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

import { SkeletonLoader } from '../skeleton-loader/SkeletonLoader';
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
  const phoneNumber = phoneByCarrier(currentTheme);
  const isClient = useIsClient();
  if (!isClient || !phoneNumber || phoneNumber.length < 1) {
    return (
      <SkeletonLoader
        style={{
          marginBottom: '-4px',
        }}
        width="12ch"
        height="14px"
      />
    );
  }

  return (
    <Link isNativeAnchorTag href={`tel:+${phoneNumber}`}>
      {phoneNumber}
    </Link>
  );
};
