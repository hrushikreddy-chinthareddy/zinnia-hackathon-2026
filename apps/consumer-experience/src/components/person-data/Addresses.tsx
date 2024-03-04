import {
  Address,
  AssistiveText,
  AssistiveTextVariant,
  Label,
} from '@zinnia/bloom/internal/components';

import { FieldData } from '@/components/field-data/FieldData';
import { isEndDatedAndEndDateUpcoming } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './PersonData.module.css';
import {
  Address as AddressInterface,
  AddressProps,
  AddressType,
} from './types';

const AddressGroup = ({ addresses }: { addresses: AddressInterface[] }) => {
  return addresses?.map((address, index) => {
    const mailingAddressText =
      address.prefAddressInd === address?.recordID?.toString()
        ? 'Mailing address'
        : '';

    return (
      <FieldData
        key={`key-${index}`}
        Label={<Label>{toSentenceCase(address.addressType)}</Label>}
        AssistiveText={
          <AssistiveText
            text={mailingAddressText}
            variant={AssistiveTextVariant.Success}
          />
        }
      >
        <Address
          addrCountry={address.addrCountry}
          addrLine1={address.addrLine1}
          addrLine2={address.addrLine2}
          city={address.city}
          state={address.state}
          zipCode={address.zipCode}
        />
      </FieldData>
    );
  });
};

export const Addresses = ({ addressData, title }: AddressProps) => {
  // Filter out any addresses where end date is past current day. In Zahara, this is equiavlent to "deletion"
  const addresses = addressData?.filter(
    address => !isEndDatedAndEndDateUpcoming(address.endDate)
  );

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
      <h2 className={styles.itemHeader}>{title}</h2>
      <div className={styles.itemsRow}>
        <AddressGroup addresses={residentialAddresses} />
        <AddressGroup addresses={boxAddresses} />
        <AddressGroup addresses={businessAddresses} />
      </div>
    </div>
  );
};
