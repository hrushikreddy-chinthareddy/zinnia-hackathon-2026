'use client';

import {
  EDeliveryPreferenceModel,
  UpdateEDeliveryPreferenceModel,
} from '@zinnia/api-types/types/preferences';
import { Email } from '@zinnia/api-types/types/sor';
import { Button, Radio } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';

import { toSentenceCase } from '@/utils/strings';

import styles from './CommunicationPreferences.module.css';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

interface EditCommunicationPreferencesProps {
  currentPreference: EDeliveryPreferenceModel;
  emailOptions: Email[];
  hasMailingAddress: boolean;
  onSubmit: (data: UpdateEDeliveryPreferenceModel) => void;
  onCancel: () => void;
}

export const EditCommunicationPreferences = ({
  currentPreference,
  emailOptions,
  onSubmit,
  hasMailingAddress,
  onCancel,
}: EditCommunicationPreferencesProps) => {
  const {
    control,
    formState: { defaultValues },
    watch,
    handleSubmit,
    reset,
    register,
  } = useForm<UpdateEDeliveryPreferenceModel>({
    defaultValues: {
      deliveryOption: currentPreference.deliveryOption,
    },
  });

  const deliveryOption = watch('deliveryOption');

  const handleFormSubmit = handleSubmit(data => {
    onSubmit(data);
  });

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <form
      className={clsx(styles.form, 'typography-content-body-sm')}
      onSubmit={handleFormSubmit}
    >
      <Controller
        name="deliveryOption"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <div className={styles.deliveryOptionRadioGroup}>
            <span>
              How would you like to receive your policy-related documents?
            </span>
            <Radio
              id="radio-delivery-option"
              onValueChange={field.onChange}
              defaultValue={defaultValues?.deliveryOption}
              options={[
                {
                  label: 'Mail',
                  ariaLabel: 'Mail',
                  value: EDeliveryPreferenceModel.deliveryOption.MAIL,
                },
                {
                  label: 'Email',
                  ariaLabel: 'Email',
                  value: EDeliveryPreferenceModel.deliveryOption.EMAIL,
                },
              ]}
            />
          </div>
        )}
      />
      {deliveryOption === EDeliveryPreferenceModel.deliveryOption.EMAIL && (
        <div
          role="radiogroup"
          className={styles.emailContainer}
          aria-labelledby="email-label"
        >
          <span id="email-label">
            Please select the email you would like to use:
          </span>
          <div className={styles.emailRadioGroup}>
            {emailOptions.map((email, index) => (
              <label
                key={`${index}-${email.emailAddress}`}
                className={styles.radioSubElement}
                defaultChecked={
                  email.emailAddress === currentPreference.email ||
                  emailOptions.length === 1
                }
              >
                <div className={styles.emailContent}>
                  <b>{toSentenceCase(email.emailType)} email</b>
                  <p>{email.emailAddress}</p>
                </div>
                <input
                  {...register('email')}
                  style={{ position: 'absolute', opacity: 0 }}
                  type="radio"
                  role="radio"
                  name="email"
                  id={`${index}-${email.emailAddress}`}
                  value={email.emailAddress}
                  defaultChecked={
                    email.emailAddress === currentPreference.email
                  }
                />
              </label>
            ))}
          </div>
        </div>
      )}
      {deliveryOption === EDeliveryPreferenceModel.deliveryOption.MAIL && (
        <div>
          {hasMailingAddress ? (
            <div>
              Your documents will be sent to your preferred mailing address.
            </div>
          ) : (
            <div>
              You don't have a mailing address on file. To switch your
              communication preference to mail, please add a mailing address
              first. If you need assistance, give us a call at&nbsp;
              <CarrierPhoneNumber />.
            </div>
          )}
        </div>
      )}
      <div className={styles.buttonContainer}>
        <Button
          type="submit"
          disabled={
            deliveryOption === EDeliveryPreferenceModel.deliveryOption.MAIL &&
            !hasMailingAddress
          }
        >
          Save changes
        </Button>
        <Button onClick={handleCancel} className={styles.cancel} mode="link">
          Cancel
        </Button>
      </div>
    </form>
  );
};
