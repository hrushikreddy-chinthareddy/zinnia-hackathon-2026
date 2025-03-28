'use client';

import { useMutation } from '@tanstack/react-query';
import { UpdateEDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';
import { Button, Icon, IconType, SideSheet } from '@zinnia/bloom/components';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { updatePreferencesByPlanCode } from '@/actions/bpm/communication-preferences-actions';
import { PolicyProfile } from '@/types/policy';
import { FormSteps } from '@/types/transactions';

import styles from './CommunicationPreferences.module.css';
import { EditCommunicationPreferences } from './EditCommunicationPreferences';
import { Error } from '../transaction-steps/error/Error';
import { Loading } from '../transaction-steps/loading/Loading';
import { Success } from '../transaction-steps/success/Success';

export const CommunicationPreferenceSidesheet = ({
  profileData,
}: {
  profileData: PolicyProfile;
}) => {
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<FormSteps>(FormSteps.FORM);

  // Close the sidesheet and reset the form
  const handleCancel = () => {
    setIsOpen(false);

    setTimeout(() => {
      setStep(FormSteps.FORM);
    }, 300);
  };

  const mailingAddress = profileData.addresses.find(
    address => address.addressId === profileData.preferredAddressIndicator
  );

  // Call api to update the communication preferences
  const { mutate } = useMutation({
    mutationFn: (data: UpdateEDeliveryPreferenceModel) =>
      updatePreferencesByPlanCode({
        planCode,
        policyNumber,
        newPreferencesData: data,
      }),
    onSuccess: () => {
      setStep(FormSteps.SUCCESS);
    },
    onError: () => {
      setStep(FormSteps.ERROR);
    },
    onMutate: () => {
      setStep(FormSteps.LOADING);
    },
  });

  const handleSubmit = (data: UpdateEDeliveryPreferenceModel) => {
    mutate(data);
  };

  return (
    <SideSheet
      header="Communication Preferences"
      trigger={
        <div className={styles.triggerContainer}>
          <Icon
            width={16}
            height={16}
            type={IconType.SETTINGS}
            className={styles.triggerIcon}
          />
          <Button mode="link" size="small" onClick={() => setIsOpen(true)}>
            Manage Preferences
          </Button>
        </div>
      }
      overrideOpen={isOpen}
      closeCallback={handleCancel}
    >
      {step === FormSteps.LOADING && <Loading />}
      {step === FormSteps.FORM && (
        <EditCommunicationPreferences
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          emailOptions={profileData.emails}
          hasMailingAddress={!!mailingAddress}
        />
      )}
      {step === FormSteps.SUCCESS && (
        <Success
          successTitle="Success!"
          successMessage="Your communication preferences have been updated."
          closeCallback={handleCancel}
        />
      )}
      {step === FormSteps.ERROR && (
        <Error
          errorTitle="Error"
          errorMessage="Your communication preferences could not be updated. Please try again."
          closeCallback={handleCancel}
        />
      )}
    </SideSheet>
  );
};
