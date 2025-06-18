import { Address } from '@zinnia/api-types/types/sor';
import { Button } from "@zinnia/bloom/components";
import { useTranslation } from "next-i18next";

import { ButtonSize } from "@deps/components/button/button";
import { AddressNotificationMethod } from "@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab.types";
import Typography, { TypographyVariant } from "@deps/components/typography/typography";
import { TranslationFiles } from "@deps/config/translations";
import { FormattedAddress } from "@deps/containers/people-data-cards/address-card/address-card.helpers";
import { useSideSheetContext } from "@deps/contexts/SideSheetContext";

import EditAddress from "../steps/notification-method/edit-address";


type AddressCardProps = {
  address: AddressNotificationMethod;
  setAddress: (val: any) => void;
  carrierId: string;
  partyData: any;
};

const AddressCard = ({ address, setAddress, carrierId, partyData }: AddressCardProps) => {
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'updateNotificationMethodForBeneficiary.updateNotificationMethodStep.notificationMethods' });
  const sidesheet = useSideSheetContext();

  const updatedPartyData = {
    ...partyData,
    address: {
      addressType: address?.addressType,
      addressId: address?.addressId,
      addressLine1: address?.addressLine1 || '',
      addressLine2: address?.addressLine2 || '',
      addressLine3: address?.addressLine3 || '',
      addressLine4: '',
      city: address?.city || null,
      country: address?.country || 'USA',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      zipPlusFour: address?.zipCodeExtension || '',
      isAddressChanged: false,
    }
  };

  const handleClose = (val: any) => {
    if (!Object.keys(val).length) {
      sidesheet.handleOpen(false);
      return;
    }
    const updatedAddress = Object.fromEntries(
      Object.entries(val)
        .filter(([_, value]) => value)
    );
    setAddress({ ...updatedAddress, country: address.country });
    sidesheet.handleOpen(false);
  };

  const handleChangeAddress = () => {
    sidesheet.changeSideSheetContent('Edit Address', <EditAddress handleClose={handleClose} partyCardData={updatedPartyData} carrierId={carrierId} />)
    sidesheet.handleOpen(true)
  };

  return (
    <div className="p-4 border-1 rounded-md border-gray-200 flex justify-between gap-6 items-center w-full">
      <div className='flex flex-col items-start'>
        <Typography variant={TypographyVariant.BodyBold} className="mb-2">{t('address')}</Typography>
        <FormattedAddress address={address as Address} />
      </div>
      <div><Button size={ButtonSize.Small} mode="link" onClick={handleChangeAddress}>{t('change')}</Button></div>
    </div>
  )
};
export default AddressCard
