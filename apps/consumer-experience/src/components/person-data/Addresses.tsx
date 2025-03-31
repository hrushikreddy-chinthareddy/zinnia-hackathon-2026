import { AddressChange } from '@zinnia/api-types/types/bpm';
import {
  AddressType,
  Address as AddressInterface,
} from '@zinnia/api-types/types/sor';
import {
  AssistiveText,
  AssistiveTextVariant,
  Label,
} from '@zinnia/bloom/components';

import { FieldData } from '@/components/field-data/FieldData';
import { Address } from '@/components/pii/Address';

import styles from './Addresses.module.css';
import { AddressProps } from './types';
import { AddEditAddressSidesheet } from '../add-edit-address/AddEditAddressSidesheet';
import {
  AddressFormFields,
  AddressObj,
} from '../add-edit-address/form-steps/add/AddEditAddress';
import { FormActionType } from '../add-edit-address/types';
const displayAddressType: { [key in AddressType]?: string } = {
  [AddressType.POBOX]: 'PO Box',
  [AddressType.RESIDENCE]: 'Residential',
  [AddressType.BUSINESS]: 'Business',
};

const AddressGroup = ({
  addresses,
  preferredAddressIndicator,
  showEditButton,
  partyId,
  userOnlyHasOneAddress,
}: {
  addresses: AddressInterface[];
  preferredAddressIndicator: string;
  showEditButton?: boolean;
  partyId: string;
  userOnlyHasOneAddress: boolean;
}) => {
  return addresses?.map((address, index) => {
    const mailingAddressText =
      preferredAddressIndicator === address?.addressId ? 'Mailing address' : '';

    //Build out the addresses array by taking all the address lines and making sure we filter all the bad values out
    // there has to be a prettier and easier way of doing this
    const addressValArray: AddressObj[] | undefined =
      [
        address.addressLine1 && { addressVal: address.addressLine1 },
        address.addressLine2 && { addressVal: address.addressLine2 },
        address.addressLine3 && { addressVal: address.addressLine3 },
      ]
        .filter(val => val != undefined && val !== '')
        .map(val => val as AddressObj) || undefined;

    const editValues: AddressFormFields = {
      // There may be a better way to handle this, but there are separate types for
      // addressType between bpm and sor types. So it gets submitted as bpm AddressChange.addressType
      // but then visually rendered as sor AddressType.
      addressType: address.addressType as unknown as AddressChange.addressType,
      addresses: addressValArray,
      city: address.city,
      state: address.state as unknown as AddressChange.state,
      zipCode: address.zipCode,
      defaultAddress: preferredAddressIndicator === address?.addressId,
    };

    return (
      <div className={styles.addressGroup} key={index}>
        <FieldData
          key={`key-${index}`}
          Label={
            <Label
              {...(showEditButton && {
                interactiveElements: [
                  <AddEditAddressSidesheet
                    key={address.addressId}
                    actionType={FormActionType.EDIT}
                    partyId={partyId}
                    values={editValues}
                    addressId={address.addressId}
                    fullAddressData={address}
                    disableEditingPreferredAddress={userOnlyHasOneAddress}
                  />,
                ],
              })}
            >
              {
                displayAddressType[
                  address.addressType || AddressChange.addressType.RESIDENCE
                ]
              }
            </Label>
          }
          AssistiveText={
            <AssistiveText
              text={mailingAddressText}
              variant={AssistiveTextVariant.Success}
            />
          }
        >
          <Address
            addrCountry={address.country}
            addrLine1={address.addressLine1}
            addrLine2={address.addressLine2}
            addrLine3={address.addressLine3}
            city={address.city}
            state={address.state}
            zipCode={address.zipCode}
            zipExt={address.zipCodeExtension}
          />
        </FieldData>
      </div>
    );
  });
};

export const Addresses = ({
  addresses,
  preferredAddressIndicator,
  partyId,
  allowAddressChanges,
}: AddressProps) => {
  const residentialAddresses = addresses?.filter(
    address => address.addressType === AddressType.RESIDENCE
  );
  const boxAddresses = addresses?.filter(
    address => address.addressType === AddressType.POBOX
  );
  const businessAddresses = addresses?.filter(
    address => address.addressType === AddressType.BUSINESS
  );

  const userOnlyHasOneAddress = addresses.length == 1;

  if (!addresses?.length) {
    return null;
  }

  return (
    <div className={styles.itemsRowContainer}>
      <div className={styles.itemsRow}>
        <AddressGroup
          addresses={residentialAddresses}
          preferredAddressIndicator={preferredAddressIndicator}
          showEditButton={allowAddressChanges}
          partyId={partyId}
          userOnlyHasOneAddress={userOnlyHasOneAddress}
        />
        <AddressGroup
          addresses={boxAddresses}
          preferredAddressIndicator={preferredAddressIndicator}
          showEditButton={allowAddressChanges}
          partyId={partyId}
          userOnlyHasOneAddress={userOnlyHasOneAddress}
        />
        <AddressGroup
          addresses={businessAddresses}
          preferredAddressIndicator={preferredAddressIndicator}
          showEditButton={allowAddressChanges}
          partyId={partyId}
          userOnlyHasOneAddress={userOnlyHasOneAddress}
        />
      </div>
    </div>
  );
};
