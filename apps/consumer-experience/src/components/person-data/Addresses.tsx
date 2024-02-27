import {
  Address,
  AssistiveText,
  AssistiveTextVariant,
  Label,
} from '@zinnia/bloom/internal/components';
import dayjs from 'dayjs';

import { FieldData } from '@/components/field-data/FieldData';
import { isEndDated } from '@/utils/data';
import { toTitleCase } from '@/utils/strings';

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
        Label={<Label>{toTitleCase(address.addressType)}</Label>}
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
  // TODO: is this the right logic? this filters out any seasonal addresses that
  // have an enddate past, but it seems like you want to show all addresses?
  // or do you only want to show seasonal addresses that are current or future?
  const addresses = addressData?.filter(
    address => !isEndDated(address.endDate)
  );

  const residentialAddresses = addresses?.filter(
    address => address.addressType === AddressType.Residence
  );
  const seasonalAddresses = addresses?.filter(
    address => address.addressType === AddressType.Seasonal
  );

  const boxAddresses = addresses?.filter(
    address => address.addressType === AddressType.PoBox
  );
  const businessAddresses = addresses?.filter(
    address => address.addressType === AddressType.Business
  );

  const currentAddressIsSeasonal = seasonalAddresses?.find(
    address =>
      dayjs().isAfter(address.startDate) && dayjs().isBefore(address.endDate)
  );

  let orderedSeasonalAddresses;
  if (currentAddressIsSeasonal) {
    const otherSeasonalAddresses = seasonalAddresses
      .filter(address => address !== currentAddressIsSeasonal)
      .sort((a, b) =>
        dayjs(a.startDate).isAfter(dayjs(b.startDate)) ? 1 : -1
      );

    orderedSeasonalAddresses = [
      currentAddressIsSeasonal,
      ...otherSeasonalAddresses,
    ];
  } else {
    orderedSeasonalAddresses = seasonalAddresses.sort((a, b) =>
      dayjs(a.startDate).isAfter(dayjs(b.startDate)) ? 1 : -1
    );
  }

  return (
    <div className={styles.itemsRowContainer}>
      <h2 className={styles.itemHeader}>{title}</h2>
      <div className={styles.itemsRow}>
        {currentAddressIsSeasonal ? (
          <>
            <AddressGroup addresses={orderedSeasonalAddresses} />
            <AddressGroup addresses={residentialAddresses} />
          </>
        ) : (
          <>
            <AddressGroup addresses={residentialAddresses} />
            <AddressGroup addresses={orderedSeasonalAddresses} />
          </>
        )}

        <AddressGroup addresses={boxAddresses} />
        <AddressGroup addresses={businessAddresses} />
      </div>
    </div>
  );
};
