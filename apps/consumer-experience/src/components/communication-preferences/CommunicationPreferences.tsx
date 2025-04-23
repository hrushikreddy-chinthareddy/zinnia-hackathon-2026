'use client';

import { EDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';

import { PolicyProfile } from '@/types/policy';

import styles from './CommunicationPreferences.module.css';
import { CommunicationPreferenceSidesheet } from './CommunicationPreferenceSidesheet';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

export const CommunicationPreferences = ({
  preferenceData,
  profileData,
}: {
  preferenceData: EDeliveryPreferenceModel[];
  profileData: PolicyProfile;
}) => {
  // Communication preferences come back from the preference management service as an array
  // of every doc type. we assume that they are all set to the same deliveryType per BPM instruction
  const communicationPreference = preferenceData?.[0];

  if (!communicationPreference) {
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

  const { deliveryOption, email } = communicationPreference;

  return (
    <div>
      <h2 className="mb-lg">Communication Preferences</h2>
      <div className={styles.itemsRowContainer}>
        <span>
          A copy of all correspondence and documents will be sent
          {deliveryOption === EDeliveryPreferenceModel.deliveryOption.EMAIL &&
            ` via email to ${email}`}
          {deliveryOption === EDeliveryPreferenceModel.deliveryOption.MAIL &&
            ` to the mailing address`}
        </span>
        <CommunicationPreferenceSidesheet
          profileData={profileData}
          currentPreference={communicationPreference}
        />
      </div>
    </div>
  );
};
