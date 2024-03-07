import { Label } from '@zinnia/bloom/internal/components';

import { FieldData } from '@/components/field-data/FieldData';
import { formatPhoneNumberWithExtension } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './PersonData.module.css';
import { Phone, PhoneProps, PhoneType } from './types';

const PhoneNumber = (phone: Phone) => {
  return (
    <div className="typography-content-body-sm">
      <p>{formatPhoneNumberWithExtension(phone)}</p>
      {phone.bestTime && <p>Call: {toSentenceCase(phone.bestTime)}</p>}
    </div>
  );
};

export const Phones = ({ phones, title }: PhoneProps) => {
  if (!phones || phones.length === 0) {
    return null;
  }

  const businessPhones = phones?.filter(
    phone => phone.phoneType === PhoneType.Business
  );
  const faxes = phones?.filter(phone => phone.phoneType === PhoneType.Fax);
  const homePhones = phones?.filter(
    phone => phone.phoneType === PhoneType.Home
  );
  const mobilePhones = phones?.filter(
    phone => phone.phoneType === PhoneType.Mobile
  );
  const otherPhones = phones?.filter(
    phone => phone.phoneType === PhoneType.Other
  );

  return (
    <div className={styles.itemsRowContainer}>
      <h2 className="mb-lg">{title}</h2>
      <div className={styles.itemsRow}>
        {businessPhones.map(phone => {
          return (
            <FieldData Label={<Label>Work phone</Label>} key="work-phone">
              <PhoneNumber {...phone} />
            </FieldData>
          );
        })}

        {faxes.map(phone => {
          return (
            <FieldData Label={<Label>Fax</Label>} key="fax-phone">
              <PhoneNumber {...phone} />
            </FieldData>
          );
        })}

        {homePhones.map(phone => {
          return (
            <FieldData Label={<Label>Home phone</Label>} key="home-phone">
              <PhoneNumber {...phone} />
            </FieldData>
          );
        })}

        {mobilePhones.map(phone => {
          return (
            <FieldData Label={<Label>Mobile phone</Label>} key="mobile-phone">
              <PhoneNumber {...phone} />
            </FieldData>
          );
        })}

        {otherPhones.map(phone => {
          return (
            <FieldData Label={<Label>Other</Label>} key="other-phone">
              <PhoneNumber {...phone} />
            </FieldData>
          );
        })}
      </div>
    </div>
  );
};
