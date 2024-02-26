import { Label } from '@zinnia/bloom/components-internal';

import { FieldData } from '@/components/field-data/FieldData';
import { formatPhoneNumberWithExtension, isEndDated } from '@/utils/data';

import styles from './PersonData.module.css';
import { PhoneProps, PhoneType } from './types';

export const Phones = ({ phoneData, title }: PhoneProps) => {
  const phones = phoneData.filter(
    phone => phone.dialNumber !== null && !isEndDated(phone.endDate)
  );

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
      <h2 className={styles.itemHeader}>{title}</h2>
      <div className={styles.itemsRow}>
        {businessPhones.map(phone => {
          return (
            <FieldData Label={<Label>Work phone</Label>} key="work-phone">
              <div className="typography-content-body-sm">
                <p>{formatPhoneNumberWithExtension(phone)}</p>
                {phone.bestTime && <p>Call: 9am-12pm EST</p>}
              </div>
            </FieldData>
          );
        })}

        {faxes.map(phone => {
          return (
            <FieldData Label={<Label>Fax</Label>} key="fax-phone">
              <div className="typography-content-body-sm">
                <p>{formatPhoneNumberWithExtension(phone)}</p>
                {phone.bestTime && <p>Call: 9am-12pm EST</p>}
              </div>
            </FieldData>
          );
        })}

        {homePhones.map(phone => {
          return (
            <FieldData Label={<Label>Home phone</Label>} key="home-phone">
              <div className="typography-content-body-sm">
                <p>{formatPhoneNumberWithExtension(phone)}</p>
                {phone.bestTime && <p>Call: 9am-12pm EST</p>}
              </div>
            </FieldData>
          );
        })}

        {mobilePhones.map(phone => {
          return (
            <FieldData Label={<Label>Mobile phone</Label>} key="mobile-phone">
              <div className="typography-content-body-sm">
                <p>{formatPhoneNumberWithExtension(phone)}</p>
                {phone.bestTime && <p>Call: 9am-12pm EST</p>}
              </div>
            </FieldData>
          );
        })}

        {otherPhones.map(phone => {
          return (
            <FieldData Label={<Label>Other</Label>} key="other-phone">
              <div className="typography-content-body-sm">
                <p>{formatPhoneNumberWithExtension(phone)}</p>
                {phone.bestTime && <p>Call: 9am-12pm EST</p>}
              </div>
            </FieldData>
          );
        })}
      </div>
    </div>
  );
};
