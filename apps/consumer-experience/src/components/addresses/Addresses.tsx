import {
  Address,
  AssistiveText,
  AssistiveTextVariant,
  Label,
} from '@zdx/bloom/components';
import styles from './Addresses.module.css';

import { FieldData } from '@/components/field-data/FieldData';

const addresses = [
  {
    addrLine1: 'T1234 Apple Street T1234 Apple Street',
    addrLine2: 'Apt 2456',
    city: 'Rockford',
    state: 'MA',
    zipCode: '02116',
    addrCountry: 'United States',
    addrType: 'Residential',
    prefAddressInd: '1',
  },
  {
    addrLine1: '1313 Mockingbird Lane',
    city: 'San Diego',
    state: 'CA',
    zipCode: '90110',
    addrCountry: 'United States',
    addrType: 'Seasonal',
  },
  {
    addrLine1: '1313 Mockingbird Lane',
    city: 'San Diego',
    state: 'CA',
    zipCode: '90110',
    addrCountry: 'United States',
    addrType: 'Business',
  },
  {
    addrLine1: '1313 Mockingbird Lane',
    city: 'San Diego',
    state: 'CA',
    zipCode: '90110',
    addrCountry: 'United States',
    addrType: 'Business',
  },
];

export const Addresses = () => {
  return (
    <div className={styles.addressRowContainer}>
      {addresses.map((address, index) => {
        const mailingAddressText =
          address.prefAddressInd === '1' ? 'Mailing address' : '';

        return (
          <FieldData
            key={`key-${index}`}
            Label={<Label>{address.addrType}</Label>}
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
      })}
    </div>
  );
};
