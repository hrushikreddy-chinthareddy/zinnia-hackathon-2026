'use client';

import { CompanyName } from '@/types/carriers';

export const EVERLY_CONTACT_PHONE_NUMBER = '1-855-290-0529';
export const WELLABE_CONTACT_PHONE_NUMBER = '1-888-222-3003';

const phoneByCarrier = (name: CompanyName | string) => {
  switch (name?.toLowerCase()) {
    case CompanyName.EVERLY:
      return EVERLY_CONTACT_PHONE_NUMBER;
    case CompanyName.WELLABE:
      return WELLABE_CONTACT_PHONE_NUMBER;
    default:
      '';
  }
};

export const CarrierPhoneNumber = ({
  carrierId,
}: {
  carrierId: string | undefined | null;
}) => {
  // const carrierName = getCarrierNameById(carrierId);
  const carrierName = '';

  return (
    <a href={`tel:+${phoneByCarrier(carrierName)}`}>
      {phoneByCarrier(carrierName)}
    </a>
  );
};
