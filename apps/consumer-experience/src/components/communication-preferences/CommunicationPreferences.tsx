'use client';

import { useQuery } from '@tanstack/react-query';
import { EDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';
import { IconType } from '@zinnia/bloom/components';

import { getCarrierConfig } from '@/queries/carrier-config-queries';
import { QueryKeys } from '@/queries/query-keys';
import { ManageChange } from '@/types/carrier-config';
import { PolicyProfile } from '@/types/policy';

import styles from './CommunicationPreferences.module.css';
import { CommunicationPreferenceSidesheet } from './CommunicationPreferenceSidesheet';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';
import { Link } from '../link/Link';
import { SkeletonLoader } from '../skeleton-loader/SkeletonLoader';

export const CommunicationPreferences = ({
  preferenceData,
  profileData,
}: {
  preferenceData: EDeliveryPreferenceModel[];
  profileData: PolicyProfile;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.CARRIER_CONFIG],
    queryFn: () => getCarrierConfig(),
  });
  // Communication preferences come back from the preference management service as an array
  // of every doc type. we assume that they are all set to the same deliveryType per BPM instruction
  const communicationPreference = preferenceData?.[0];
  const componentHeader = <h2 className="mb-lg">Communication Preferences</h2>;

  if (isLoading) {
    return (
      <div className={styles.itemsRowContainer}>
        {componentHeader}
        <SkeletonLoader width="100%" height="14px" />
      </div>
    );
  }

  const communicationsConfig = data?.policyProfile?.communicationPreference;

  if (!communicationPreference) {
    return (
      <div className={styles.itemsRowContainer}>
        {componentHeader}
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
      {componentHeader}
      <div className={styles.itemsRowContainer}>
        <span>
          A copy of all correspondence and documents will be sent
          {deliveryOption === EDeliveryPreferenceModel.deliveryOption.EMAIL &&
            ` via email to ${email}`}
          {deliveryOption === EDeliveryPreferenceModel.deliveryOption.MAIL &&
            ` to the mailing address`}
        </span>
        {communicationsConfig?.manageChanges === ManageChange.EXTERNAL ? (
          <Link
            href={communicationsConfig.url || ''}
            text="Manage preferences"
            iconType={IconType.SETTINGS}
            className="settings-link-icon-rotated"
          />
        ) : (
          <CommunicationPreferenceSidesheet
            profileData={profileData}
            currentPreference={communicationPreference}
          />
        )}
      </div>
    </div>
  );
};
