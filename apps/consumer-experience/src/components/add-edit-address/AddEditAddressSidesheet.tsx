'use client';

import { AddressChange } from '@zinnia/api-types/types/bpm';
import { SideSheet, Button, Icon, IconType } from '@zinnia/bloom/components';
import { useParams } from 'next/navigation';
import { FC, ReactNode, useState } from 'react';

import {
  postAddAddress,
  putUpdateAddress,
  putEndDateAddress,
} from '@/actions/bpm/address-actions';
import { FormSteps } from '@/types/transactions';
import { zipCodeInParts } from '@/utils/address';

import styles from './AddEditAddressSidesheet.module.css';
import { Error } from '../transaction-steps/error/Error';
import { Loading } from '../transaction-steps/loading/Loading';
import { Success } from '../transaction-steps/success/Success';
import {
  AddEditAddress,
  AddressFormFields,
  AddressObj,
} from './form-steps/add/AddEditAddress';
import { AddEditAddressSidesheetProps, FormActionType } from './types';
import { Confirm } from '../transaction-steps/confirm/Confirm';

const formatAddressLines = (
  addressLines?: AddressObj[]
): Record<string, string> => {
  if (!addressLines) {
    return {};
  }

  const formattedAddressLines: Record<string, string> = {};

  addressLines.forEach((line, index) => {
    if (!line?.addressVal) {
      return;
    }

    formattedAddressLines[`addressLine${index + 1}`] = line.addressVal;
  });

  return formattedAddressLines;
};

export const AddEditAddressSidesheet: FC<AddEditAddressSidesheetProps> = ({
  values,
  actionType = FormActionType.ADD,
  partyId,
  addressId,
  fullAddressData,
}) => {
  //TODO: decide if we want to do this still
  // const updateBpmAction = useBpmStore(state => state.updateBpmAction);
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FormSteps>();
  const [errorTitle, setErrorTitle] = useState('An error occurred');
  const [errorMessage, setErrorMessage] = useState<ReactNode>(
    'Some generic messaging that will get updated based on the api response'
  );
  const [isServerError, setIsServerError] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Success!');
  const [successMessage, setSuccessMessage] = useState(
    'Some generic messaging that will get updated based on the api response'
  );

  const handleRemoveClick = () => setStep(FormSteps.CONFIRM);

  const removeCallback = async () => {
    setStep(FormSteps.LOADING);
    const { data, error } = await putEndDateAddress({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      partyId,
      addressId: fullAddressData?.addressId,
      addressChangeRequest: {
        address: {
          ...fullAddressData,
          //ridiculous casting because BPM and SOR types are slightly off
          state: fullAddressData?.state as unknown as AddressChange.state,
          addressType:
            fullAddressData?.addressType as unknown as AddressChange.addressType,
          country: fullAddressData?.country as unknown as AddressChange.country,
        },
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

      //TODO: decide if we want to do this still
      // updateBpmAction({
      //   actionType: ActionTypes.REMOVE,
      //   bankAccountNumber: values?.accountNumber,
      // });
      return;
    }
  };

  const handleAddEdit = async (requestValues: AddressFormFields) => {
    setStep(FormSteps.LOADING);

    const formattedAddressLines = formatAddressLines(requestValues.addresses);
    const zipCodeParts = zipCodeInParts(requestValues?.zipCode);
    const addressChangeRequest = {
      preferredAddressIndicator: requestValues.defaultAddress
        ? AddressChange.preferredAddressIndicator.YES
        : AddressChange.preferredAddressIndicator.NO,
      address: {
        ...formattedAddressLines,
        ...zipCodeParts,
        // TODO: i think these are for seasonal address setting which isn't available
        // yet so leaving null
        // startDate: '4186-48-30',
        // endDate: '0669-10-40',
        addressType: requestValues.addressType,
        city: requestValues.city,
        // TODO: should we make the dropdown use the addressChange state values?
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
          })
        : postAddAddress({
            planCode: params.planCode,
            policyNumber: params.policyNumber,
            partyId,
            addressChangeRequest,
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
      return;
    }

    if (data) {
      setSuccessTitle(data.messages.title);
      setSuccessMessage(data.messages.message);
      setStep(FormSteps.SUCCESS);

      // I'm a little confused by this. Is this only really used for polling?
      // shouldn't this already be set previously? or is this just actionType
      // relavant to polling and not to the sidesheet display? if that's the case
      // i think we should rename this to activeAction or something? or maybe
      // present participle like "ADDING"? If we want polling with addresses,
      // will also need to update to make the accountNumber generic somehow. like "item id"?
      // updateBpmAction({
      //   actionType: ActionTypes.ADD,
      // });
      return;
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
          className={actionType === FormActionType.ADD ? styles.addAddress : ''}
          size="small"
          mode="link"
          onClick={() => setOpen(true)}
          // Just added this to be extra clear that this is how a user would delete the address
          // as well as edit
          aria-label={
            actionType === FormActionType.EDIT ? 'Edit or remove address' : ''
          }
        >
          <Icon small={actionType === FormActionType.ADD} type={triggerIcon} />
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
        />
      )}
      {step === FormSteps.CONFIRM && (
        <Confirm
          confirmTitle="Remove address?"
          confirmButtonText="Remove Address"
          confirmCallback={removeCallback}
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
