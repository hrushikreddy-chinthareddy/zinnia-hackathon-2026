import { Phone, PhoneType } from '@zinnia/api-types/types/sor';
import { Label } from '@zinnia/bloom/components';

import { FieldData } from '@/components/field-data/FieldData';
import { toSentenceCase } from '@/utils/strings';

import styles from './PersonData.module.css';
import { PhoneProps } from './types';
import { PhoneNumber } from '../pii/PhoneNumber';
import { PiiWrapper } from '../pii/PiiWrapper';

const PhoneNumberInternal = (phone: Phone) => {
  return (
    <div className="typography-content-body-sm">
      <p>
        <PhoneNumber phoneNumber={phone} />
      </p>
      {phone.bestTime && (
        <p>
          Call: <PiiWrapper>{toSentenceCase(phone.bestTime)}</PiiWrapper>
        </p>
      )}
    </div>
  );
};

export const Phones = ({ phones, title }: PhoneProps) => {
  if (
    !phones ||
    phones.length === 0 ||
    // A phone object may return but without the dialNumber it will only show the label and show blank which is useless
    phones.filter(phone => phone.dialNumber).length === 0
  ) {
    return null;
  }

  const businessPhones = phones?.filter(
    phone => phone.phoneType === PhoneType.BUSINESS
  );
  const faxes = phones?.filter(phone => phone.phoneType === PhoneType.FAX);
  const homePhones = phones?.filter(
    phone => phone.phoneType === PhoneType.HOME
  );
  const mobilePhones = phones?.filter(
    phone => phone.phoneType === PhoneType.MOBILE
  );
  const otherPhones = phones?.filter(
    phone => phone.phoneType === PhoneType.OTHER
  );

  return (
    <div className={styles.itemsRowContainer}>
      <h2 className="mb-lg">{title}</h2>
      <div className={styles.itemsRow}>
        {businessPhones.map(phone => {
          return (
            <FieldData Label={<Label>Work phone</Label>} key="work-phone">
              <PhoneNumberInternal {...phone} />
            </FieldData>
          );
        })}

        {faxes.map(phone => {
          return (
            <FieldData Label={<Label>Fax</Label>} key="fax-phone">
              <PhoneNumberInternal {...phone} />
            </FieldData>
          );
        })}

        {homePhones.map(phone => {
          return (
            <FieldData Label={<Label>Home phone</Label>} key="home-phone">
              <PhoneNumberInternal {...phone} />
            </FieldData>
          );
        })}

        {mobilePhones.map(phone => {
          return (
            <FieldData Label={<Label>Mobile phone</Label>} key="mobile-phone">
              <PhoneNumberInternal {...phone} />
            </FieldData>
          );
        })}

        {otherPhones.map(phone => {
          return (
            <FieldData Label={<Label>Other</Label>} key="other-phone">
              <PhoneNumberInternal {...phone} />
            </FieldData>
          );
        })}
      </div>
    </div>
  );
};
