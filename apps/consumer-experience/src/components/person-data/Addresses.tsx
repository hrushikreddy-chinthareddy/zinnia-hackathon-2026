import {
  Address,
  AssistiveText,
  AssistiveTextVariant,
  Label,
} from '@zinnia/bloom/internal/components';

import { FieldData } from '@/components/field-data/FieldData';

import styles from './PersonData.module.css';
import {
  Address as AddressInterface,
  AddressProps,
  AddressType,
} from './types';

const displayAddressType: { [key in AddressType]?: string } = {
  [AddressType.PoBox]: 'PO Box',
  [AddressType.Residence]: 'Residential',
  [AddressType.Business]: 'Business',
};

const AddressGroup = ({ addresses }: { addresses: AddressInterface[] }) => {
  return addresses?.map((address, index) => {
    const mailingAddressText =
      address.preferredAddressIndicator === address?.recordID?.toString()
        ? 'Mailing address'
        : '';

    return (
      <FieldData
        key={`key-${index}`}
        Label={
          <Label>
            {displayAddressType[address.addressType || AddressType.Residence]}
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

export const Addresses = ({ addresses, title }: AddressProps) => {
  if (addresses.length === 0) {
    return null;
  }

  const residentialAddresses = addresses?.filter(
    address => address.addressType === AddressType.Residence
  );

  // TODO: this was determined to be out of scope by ops since Zahara does not have a way of adding a recurring
  // date, and endDate indicates deletion in the db
  // const seasonalAddresses = addresses?.filter(
  //   address => address.addressType === AddressType.Seasonal
  // );

  const boxAddresses = addresses?.filter(
    address => address.addressType === AddressType.PoBox
  );
  const businessAddresses = addresses?.filter(
    address => address.addressType === AddressType.Business
  );

  return (
    <div className={styles.itemsRowContainer}>
      <h2 className="mb-lg">{title}</h2>
      <div className={styles.itemsRow}>
        <AddressGroup addresses={residentialAddresses} />
        <AddressGroup addresses={boxAddresses} />
        <AddressGroup addresses={businessAddresses} />
      </div>
    </div>
  );
};
