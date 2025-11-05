'use client';

import { AddressChange } from '@zinnia/api-types/types/bpm';
import { SideSheet, Icon, IconType } from '@zinnia/bloom/components';
import { useParams } from 'next/navigation';
import { FC, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  postAddAddress,
  putUpdateAddress,
  putEndDateAddress,
} from '@/actions/bpm/address-actions';
import { Button } from '@/components/button/Button';
import { ActionTypes, PropertyKeys, useBpmStore } from '@/store/store';
import { FormSteps } from '@/types/transactions';
import { zipCodeInParts } from '@/utils/address';

import styles from './AddEditAddressSidesheet.module.css';
import { formatAddressLines, generateChanges } from './utils';
import { Error } from '../transaction-steps/error/Error';
import { Loading } from '../transaction-steps/loading/Loading';
import { Success } from '../transaction-steps/success/Success';
import { AddEditAddress } from './form-steps/add/AddEditAddress';
import {
  AddEditAddressSidesheetProps,
  AddressFormFields,
  FormActionType,
} from './types';
import { Confirm } from '../transaction-steps/confirm/Confirm';

export const AddEditAddressSidesheet: FC<AddEditAddressSidesheetProps> = ({
  values,
  actionType = FormActionType.ADD,
  partyId,
  addressId,
  fullAddressData,
  disableEditingPreferredAddress,
  addresses,
}) => {
  const updateBpmAction = useBpmStore(state => state.updateBpmAction);
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FormSteps>();
  const [errorTitle, setErrorTitle] = useState('An error occurred');
  const [correlationErrorId, setCorrelationErrorId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<ReactNode>(
    'Some generic messaging that will get updated based on the api response'
  );
  const [isServerError, setIsServerError] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Success!');
  const [successMessage, setSuccessMessage] = useState(
    'Some generic messaging that will get updated based on the api response'
  );

  const handleRemoveClick = () => setStep(FormSteps.CONFIRM);
  const correlationId = uuidv4();

  const removeCallback = async () => {
    setStep(FormSteps.LOADING);
    const wasPreferred = fullAddressData?.isPreferred;
    const nextPreferredAddressId = addresses?.find(
      address => !address.isPreferred
    )?.addressId;

    const { data, error } = await putEndDateAddress({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      partyId,
      addressId: fullAddressData?.addressId,
      addressChangeRequest: {
        address: {
          ...fullAddressData,
          isPreferred: false,
          //ridiculous casting because BPM and SOR types are slightly off
          state: fullAddressData?.state as unknown as AddressChange.state,
          addressType:
            fullAddressData?.addressType as unknown as AddressChange.addressType,
          country: fullAddressData?.country as unknown as AddressChange.country,
        },
        preferredAddressIndicator: AddressChange.preferredAddressIndicator.NO,
        preferredAddressId: wasPreferred ? nextPreferredAddressId : undefined,
      },
    });

    if (error) {
      setIsServerError(error.status >= 500);
      setErrorTitle(error.name);
      setErrorMessage(error.message);
      setStep(FormSteps.ERROR);
      return;
    }
    if (data) {
      setSuccessTitle(data.messages.title);
      setSuccessMessage(data.messages.message);
      setStep(FormSteps.SUCCESS);

      updateBpmAction({
        actionType: ActionTypes.REMOVE,
        propertyKey: PropertyKeys.ADDRESSES,
        itemKey: 'addressId',
        itemValue: addressId,
      });
      return;
    }
  };

  const handleAddEdit = async (
    requestValues: AddressFormFields,
    dirtyFields: AddressFormFields
  ) => {
    setStep(FormSteps.LOADING);

    const formattedAddressLines = formatAddressLines(requestValues.addresses);
    const zipCodeParts = zipCodeInParts(requestValues?.zipCode);
    const addressChangeRequest = {
      //TODO: The API needs to remove this from the required request body. This has been replaced by `isPreferred` on the address itself but
      // The API currently 500s without the indicator value.
      preferredAddressIndicator: requestValues.defaultAddress
        ? AddressChange.preferredAddressIndicator.YES
        : AddressChange.preferredAddressIndicator.NO,
      address: {
        ...formattedAddressLines,
        ...zipCodeParts,
        isPreferred: requestValues.defaultAddress,
        // TODO: i think these are for seasonal address setting which isn't available
        // yet so leaving null
        // startDate: '4186-48-30',
        // endDate: '0669-10-40',
        addressType: requestValues.addressType,
        city: requestValues.city,
        state: requestValues.state,
        country: AddressChange.country.US,
      },
    };

    const request =
      actionType === FormActionType.EDIT
        ? putUpdateAddress({
            planCode: params.planCode,
            policyNumber: params.policyNumber,
            partyId,
            addressId,
            addressChangeRequest,
            correlationId,
          })
        : postAddAddress({
            planCode: params.planCode,
            policyNumber: params.policyNumber,
            partyId,
            addressChangeRequest,
            correlationId,
          });

    // TODO: Create a generic request method. It still takes in the same things, with the addition of a type.
    // I'm not sure how much we can genericize these actions since they call different endpoints,
    // will have different message language and different checks before submitting i.e. bank checks for duplicates
    // but i don't know if addresses have that same restriction...
    // maybe we can madlib it in some way that's like `type` and `action`
    const { data, error } = await request;

    if (error) {
      setIsServerError(error.status >= 500);
      setErrorTitle(error.name);
      setErrorMessage(error.message);
      setStep(FormSteps.ERROR);
      setCorrelationErrorId(error.correlationId);
      return;
    }

    if (data) {
      setSuccessTitle(data.messages.title);
      setSuccessMessage(data.messages.message);
      setStep(FormSteps.SUCCESS);

      if (actionType === FormActionType.EDIT) {
        const changes = generateChanges(dirtyFields);

        updateBpmAction({
          actionType: ActionTypes.EDIT,
          propertyKey: PropertyKeys.ADDRESSES,
          itemKey: changes[0]?.fieldName || '',
          itemValue: changes[0]?.value || '',
          changes,
        });
      } else {
        updateBpmAction({
          actionType: ActionTypes.ADD,
          propertyKey: PropertyKeys.ADDRESSES,
          itemKey: 'addressLine1',
          itemValue: values?.addresses?.[0]?.addressVal || '',
        });
      }
    }
  };

  const errorCloseCallback = () => {
    setStep(undefined);
  };

  const onClose = () => {
    setOpen(false);

    // Timeout is here to prevent the flash of the internal sidesheet component from showing
    // as the animation happens
    setTimeout(() => {
      setStep(undefined);
    }, 300);
  };

  const title =
    actionType === FormActionType.ADD ? 'Add address' : 'Edit address';
  const triggerText = actionType === FormActionType.ADD ? 'Add address' : '';
  const triggerIcon =
    actionType === FormActionType.ADD ? IconType.ADD : IconType.EDIT_ALT;
  return (
    <SideSheet
      header={title}
      overrideOpen={open}
      closeCallback={onClose}
      trigger={
        <Button
          className={
            actionType === FormActionType.ADD
              ? styles.addAddress
              : styles.editAddress
          }
          size="small"
          mode="link"
          onClick={() => setOpen(true)}
          // Just added this to be extra clear that this is how a user would delete the address
          // as well as edit
          aria-label={
            actionType === FormActionType.EDIT ? 'Edit or remove address' : ''
          }
        >
          <Icon small type={triggerIcon} />
          {triggerText}
        </Button>
      }
    >
      {!step && (
        <AddEditAddress
          values={values}
          cancelCallback={onClose}
          submitCallback={handleAddEdit}
          actionType={actionType}
          removeCallback={handleRemoveClick}
          disableEditingPreferredAddress={disableEditingPreferredAddress}
          correlationId={correlationId}
        />
      )}
      {step === FormSteps.CONFIRM && (
        <Confirm
          confirmTitle="Remove address?"
          confirmButtonText="Remove Address"
          confirmCallback={removeCallback}
          correlationId={correlationId}
          denyCallback={() => setStep(undefined)}
        />
      )}
      {step === FormSteps.LOADING && <Loading />}
      {step === FormSteps.ERROR && (
        <Error
          errorTitle={errorTitle}
          isServerError={isServerError}
          errorMessage={errorMessage}
          closeCallback={errorCloseCallback}
          correlationId={correlationErrorId}
        />
      )}
      {step === FormSteps.SUCCESS && (
        <Success
          successTitle={successTitle}
          successMessage={successMessage}
          closeCallback={onClose}
        />
      )}
    </SideSheet>
  );
};
