'use client';

import { SideSheet, Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC, ReactNode, useState } from 'react';

import { bankAccountNumberSanitizer } from '@/utils/data';

import styles from './AddEditBankSidesheet.module.css';
import { AddEditBank } from './form-steps/add-edit/AddEditBank';
import { Error } from './form-steps/error/Error';
import { Loading } from './form-steps/loading/Loading';
import { RemoveBankConfirm } from './form-steps/remove-bank-confirm/RemoveBankConfirm';
import { Success } from './form-steps/success/Success';
import { FormFields, FormMode, FormSteps } from './shared-types';

export interface AddEditBankSidesheetProps {
  mode: FormMode;
  values?: FormFields;
  autopayEnabled?: boolean;
  numberOfAccounts?: number;
}

export const AddEditBankSidesheet: FC<AddEditBankSidesheetProps> = ({
  mode,
  values,
  autopayEnabled,
  numberOfAccounts,
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FormSteps>(FormSteps.ADD_EDIT);
  const [errorTitle, setErrorTitle] = useState('An error occurred');
  const [errorMessage, setErrorMessage] = useState<ReactNode>(
    'Some generic messaging that will get updated based on the api response'
  );
  const [successTitle, setSuccessTitle] = useState('Success!');
  const [successMessage, setSuccessMessage] = useState(
    'Some generic messaging that will get updated based on the api response'
  );

  /**
   * TODO: Replace with real API request
   */
  const handleAddEdit = () => {
    setStep(FormSteps.LOADING);
    if (mode === FormMode.ADD) {
      console.log('API Request to add. Throw an error to test!');
      setTimeout(() => {
        setErrorTitle('Could not be added');
        setErrorMessage('The bank could not be added');
        setStep(FormSteps.ERROR);
      }, 3000);
    } else {
      console.log('API request to edit');
      setTimeout(() => {
        setSuccessTitle('Success!');
        setSuccessMessage(
          `${values?.bankNickname} ending in ${bankAccountNumberSanitizer(values?.accountNumber)} was updated.`
        );
        setStep(FormSteps.SUCCESS);
      }, 3000);
    }
  };

  const handleRemoveConfirm = () => {
    // Can't delete if its the only bank account
    if (numberOfAccounts === 1) {
      setErrorTitle('This is the only account saved.');
      setErrorMessage(
        'You must have at least one banking account saved. To remove this one, first add another bank account.'
      );
      setStep(FormSteps.ERROR);
      return;
    }
    // Can't delete autopay accounts
    if (autopayEnabled) {
      setErrorTitle("We can't delete autopay account.");
      setErrorMessage(
        <span>
          To manage your autopay details, call us at{' '}
          <a href="">1-855-290-0529</a>
        </span>
      );
      setStep(FormSteps.ERROR);
      return;
    }

    setStep(FormSteps.REMOVE_CONFIRM);
  };

  /**
   * TODO: Replace with real API request
   */
  const handleRemove = () => {
    setStep(FormSteps.LOADING);
    setTimeout(() => {
      setSuccessTitle('Success!');
      setSuccessMessage(
        `${values?.bankNickname} ending in ${bankAccountNumberSanitizer(values?.accountNumber)} was removed from your policy.`
      );
      setStep(FormSteps.SUCCESS);
    }, 3000);
  };

  return (
    <SideSheet
      header={`${mode === FormMode.ADD ? 'Add New' : 'Edit'} Bank Account`}
      overrideOpen={open}
      closeCallback={() => setStep(FormSteps.ADD_EDIT)}
      trigger={
        <Button
          className={clsx({
            [styles.addBank as string]: mode === FormMode.ADD,
          })}
          size="small"
          mode="link"
          onClick={() => setOpen(true)}
          aria-label={`${mode} bank`}
        >
          <Icon
            small={mode === FormMode.ADD}
            type={mode === FormMode.ADD ? IconType.ADD : IconType.EDIT_ALT}
          />
          {mode === FormMode.ADD && ' Add another bank account'}
        </Button>
      }
    >
      {step === FormSteps.ADD_EDIT && (
        <AddEditBank
          mode={mode}
          values={values}
          cancelCallback={() => setOpen(false)}
          submitCallback={handleAddEdit}
          removeCallback={handleRemoveConfirm}
        />
      )}
      {step === FormSteps.REMOVE_CONFIRM && (
        <RemoveBankConfirm
          accountNumber={values?.accountNumber}
          bankNickname={values?.bankNickname}
          cancelCallback={() => setOpen(false)}
          confirmCallback={handleRemove}
        />
      )}
      {step === FormSteps.LOADING && <Loading />}
      {step === FormSteps.ERROR && (
        <Error
          errorTitle={errorTitle}
          errorMessage={errorMessage}
          closeCallback={() => setOpen(false)}
        />
      )}
      {step === FormSteps.SUCCESS && (
        <Success
          successTitle={successTitle}
          successMessage={successMessage}
          closeCallback={() => setOpen(false)}
        />
      )}
    </SideSheet>
  );
};
