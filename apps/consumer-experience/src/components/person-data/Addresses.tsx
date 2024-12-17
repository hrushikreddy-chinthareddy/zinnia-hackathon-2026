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

import styles from './PersonData.module.css';
import { AddressProps } from './types';
import { AddEditAddressSidesheet } from '../add-edit-address/AddEditAddressSidesheet';

const displayAddressType: { [key in AddressType]?: string } = {
  [AddressType.POBOX]: 'PO Box',
  [AddressType.RESIDENCE]: 'Residential',
  [AddressType.BUSINESS]: 'Business',
};

const AddressGroup = ({
  addresses,
  preferredAddressIndicator,
}: {
  addresses: AddressInterface[];
  preferredAddressIndicator: string;
}) => {
  return addresses?.map((address, index) => {
    const mailingAddressText =
      preferredAddressIndicator === address?.addressId ? 'Mailing address' : '';

    return (
      <FieldData
        key={`key-${index}`}
        Label={
          <Label>
            {displayAddressType[address.addressType || AddressType.RESIDENCE]}
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
          city={address.city}
          state={address.state}
          zipCode={address.zipCode}
          zipExt={address.zipCodeExtension}
        />
      </FieldData>
    );
  });
};

export const Addresses = ({
  addresses,
  title,
  preferredAddressIndicator,
  partyId,
}: AddressProps) => {
  if (addresses.length === 0) {
    return null;
  }

  const residentialAddresses = addresses?.filter(
    address => address.addressType === AddressType.RESIDENCE
  );

  const boxAddresses = addresses?.filter(
    address => address.addressType === AddressType.POBOX
  );
  const businessAddresses = addresses?.filter(
    address => address.addressType === AddressType.BUSINESS
  );

  return (
    <div className={styles.itemsRowContainer}>
      <h2 className="mb-lg">{title}</h2>
      <div className={styles.itemsRow}>
        <AddressGroup
          addresses={residentialAddresses}
          preferredAddressIndicator={preferredAddressIndicator}
        />
        <AddressGroup
          addresses={boxAddresses}
          preferredAddressIndicator={preferredAddressIndicator}
        />
        <AddressGroup
          addresses={businessAddresses}
          preferredAddressIndicator={preferredAddressIndicator}
        />
        <AddEditAddressSidesheet partyId={partyId || ''} />
      </div>
    </div>
  );
};
