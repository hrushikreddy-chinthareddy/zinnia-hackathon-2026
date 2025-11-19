'use client';

import { useMutation } from '@tanstack/react-query';
import { Button, Icon, IconType, SideSheet } from '@zinnia/bloom/components';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { updatePreferencesByPlanCode } from '@/actions/bpm/communication-preferences-actions';
import { ApiResponseError } from '@/services';
import { PolicyProfile } from '@/types/policy';
import { FormSteps, ResponseMessage } from '@/types/transactions';
import { filterItemsWithPastEndDate } from '@/utils/data';
import {
  EDeliveryPreferenceModel,
  UpdateEDeliveryPreferenceModel,
} from '@zinnia/api-types/types/preferences';

import styles from './CommunicationPreferences.module.css';
import { EditCommunicationPreferences } from './EditCommunicationPreferences';
import { Error } from '../transaction-steps/error/Error';
import { Loading } from '../transaction-steps/loading/Loading';
import { Success } from '../transaction-steps/success/Success';

export const CommunicationPreferenceSidesheet = ({
  profileData,
  currentPreference,
}: {
  profileData: PolicyProfile;
  currentPreference: EDeliveryPreferenceModel;
}) => {
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<FormSteps>(FormSteps.FORM);
  const [apiSuccessResponse, setApiSuccessResponse] =
    useState<ResponseMessage>();
  const [apiErrorResponse, setApiErrorResponse] =
    useState<ApiResponseError | null>();

  // Close the sidesheet and reset the form
  const handleCancel = () => {
    setIsOpen(false);
    setApiSuccessResponse(undefined);
    setApiErrorResponse(undefined);

    setTimeout(() => {
      setStep(FormSteps.FORM);
    }, 300);
  };

  const mailingAddress = profileData.addresses.find(
    address => address.isPreferred
  );

  // Call api to update the communication preferences
  const { mutate } = useMutation({
    mutationFn: (data: UpdateEDeliveryPreferenceModel) =>
      updatePreferencesByPlanCode({
        planCode,
        policyNumber,
        policyPartyId: profileData.partyId,
        newPreferencesData: data,
      }),
    onSuccess: ({ data, error }) => {
      if (data) {
        setApiSuccessResponse(data.messages);
        setStep(FormSteps.SUCCESS);
      } else {
        setApiErrorResponse(error);
        setStep(FormSteps.ERROR);
      }
    },
    // This will never be hit unless we missed handling somewhere
    // since we catch all errors on the server side
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
          <Icon small type={IconType.SETTINGS} className={styles.triggerIcon} />
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
          emailOptions={filterItemsWithPastEndDate(profileData.emails)}
          currentPreference={currentPreference}
          hasMailingAddress={!!mailingAddress}
        />
      )}
      {step === FormSteps.SUCCESS && (
        <Success
          successTitle={apiSuccessResponse?.title || 'Thanks!'}
          successMessage={
            apiSuccessResponse?.message ||
            'Your communication preference is being updated.'
          }
          closeCallback={handleCancel}
        />
      )}
      {step === FormSteps.ERROR && (
        <Error
          isServerError={
            !!(apiErrorResponse?.status && apiErrorResponse?.status >= 500)
          }
          errorTitle={apiErrorResponse?.name || "Sorry, that didn't work"}
          errorMessage={apiErrorResponse?.message}
          correlationId={apiErrorResponse?.correlationId}
          closeCallback={handleCancel}
        />
      )}
    </SideSheet>
  );
};
