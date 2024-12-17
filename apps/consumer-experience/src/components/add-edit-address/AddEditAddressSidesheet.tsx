'use client';

import { SideSheet, Button, Icon, IconType } from '@zinnia/bloom/components';
import { useParams } from 'next/navigation';
import { FC, ReactNode, useState } from 'react';

import { useBpmStore } from '@/store/store';
import { FormSteps } from '@/types/transactions';

import styles from './AddEditAddressSidesheet.module.css';
import { Error } from '../transaction-steps/error/Error';
import { Loading } from '../transaction-steps/loading/Loading';
import { Success } from '../transaction-steps/success/Success';
import { AddAddress, AddressFormFields } from './form-steps/add/AddAddress';

export interface AddEditAddressSidesheetProps {
  partyId: string;

  values?: AddressFormFields;
}

export const AddEditAddressSidesheet: FC<AddEditAddressSidesheetProps> = ({
  values,
  partyId,
}) => {
  const updateBpmAction = useBpmStore(state => state.updateBpmAction);
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

  const handleAdd = async (requestValues: AddressFormFields) => {
    setStep(FormSteps.LOADING);

    console.log('adding');

    setTimeout(() => {
      setStep(FormSteps.SUCCESS);
    }, 2000);
    // const { data, error } = await addBankRequest({
    //   planCode: params.planCode,
    //   policyNumber: params.policyNumber,
    //   partyId,
    //   bankId,
    //   bankAccountChangeRequest: {
    //     bankAccount: {
    //       ...requestValues,
    //       accountStatus: AccountStatus.ACTIVEBANKACCOUNT,
    //       nameOnAccount: policyOwner,
    //     },
    //   },
    // });
    // if (error) {
    //   setIsServerError(error.status >= 500);
    //   setErrorTitle(error.name);
    //   setErrorMessage(error.message);
    //   setStep(FormSteps.ERROR);
    //   return;
    // }
    // if (data) {
    //   setSuccessTitle(data.messages.title);
    //   setSuccessMessage(data.messages.message);
    //   setStep(FormSteps.SUCCESS);

    //   updateBpmAction({
    //     actionType: ActionTypes.ADD,
    //     bankAccountNumber: requestValues.accountNumber,
    //   });
    //   return;
    // }
  };

  const onClose = () => {
    setOpen(false);

    // Timeout is here to prevent the flash of the internal sidesheet component from showing
    // as the animation happens
    setTimeout(() => {
      setStep(undefined);
    }, 300);
  };

  return (
    <SideSheet
      header="Add Address"
      overrideOpen={open}
      closeCallback={onClose}
      trigger={
        <Button
          className={styles.addBank as string}
          size="small"
          mode="link"
          onClick={() => setOpen(true)}
        >
          <Icon small type={IconType.ADD} />
          Add address
        </Button>
      }
    >
      {!step && (
        <AddAddress
          values={values}
          cancelCallback={onClose}
          submitCallback={handleAdd}
        />
      )}
      {step === FormSteps.LOADING && <Loading />}
      {step === FormSteps.ERROR && (
        <Error
          errorTitle={errorTitle}
          isServerError={isServerError}
          errorMessage={errorMessage}
          closeCallback={onClose}
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
