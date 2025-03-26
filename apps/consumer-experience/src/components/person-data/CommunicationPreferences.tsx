import { EDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';

import styles from './PersonData.module.css';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

export const CommunicationPreferences = ({
  preferenceData,
}: {
  preferenceData: EDeliveryPreferenceModel[];
}) => {
  if (preferenceData.length === 0 || !preferenceData[0]) {
    return (
      <div className={styles.itemsRowContainer}>
        <h2 className="mb-lg">Communication Preferences</h2>
        <span>
          No communication preference chosen. Call <CarrierPhoneNumber /> to
          update your preference.
        </span>
      </div>
    );
  }

  const { deliveryOption, email } = preferenceData[0];
  return (
    <div className={styles.itemsRowContainer}>
      <h2 className="mb-lg">Communication Preferences</h2>
      <span>
        A copy of all correspondence and documents will be sent
        {deliveryOption === EDeliveryPreferenceModel.deliveryOption.EMAIL &&
          ` via email to ${email}`}
        {deliveryOption === EDeliveryPreferenceModel.deliveryOption.MAIL &&
          ` to the mailing address`}
        {/* @TODO: API also returns a fax delivery option. Awaiting more info from product */}
      </span>
    </div>
  );
};
