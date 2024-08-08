'use client';

import { AccountStatus } from '@zinnia/api-types/types/sor';
import { SideSheet, Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useParams } from 'next/navigation';
import { FC, ReactNode, useState } from 'react';

import {
  addEditBankRequest,
  putEndDateBankAccount,
} from '@/actions/bpm-actions';
import { useUser } from '@/hooks/use-user';
import { ActionTypes, useBpmStore } from '@/store/store';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';

import styles from './AddEditBankSidesheet.module.css';
import { AddEditBank } from './form-steps/add-edit/AddEditBank';
import { Error } from './form-steps/error/Error';
import { Loading } from './form-steps/loading/Loading';
import { RemoveBankConfirm } from './form-steps/remove-bank-confirm/RemoveBankConfirm';
import { Success } from './form-steps/success/Success';
import { BankFormFields, FormMode, FormSteps } from './shared-types';

export interface AddEditBankSidesheetProps {
  mode: FormMode;
  partyId: string;
  bankId?: string;
  values?: BankFormFields;
  autopayEnabled?: boolean;
  numberOfAccounts?: number;
}

export const AddEditBankSidesheet: FC<AddEditBankSidesheetProps> = ({
  mode,
  values,
  partyId,
  bankId,
  autopayEnabled,
  numberOfAccounts,
}) => {
  const updateBpmAction = useBpmStore(state => state.updateBpmAction);
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const [step, setStep] = useState<FormSteps>(FormSteps.ADD_EDIT);
  const [errorTitle, setErrorTitle] = useState('An error occurred');
  const [errorMessage, setErrorMessage] = useState<ReactNode>(
    'Some generic messaging that will get updated based on the api response'
  );
  const [isServerError, setIsServerError] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Success!');
  const [successMessage, setSuccessMessage] = useState(
    'Some generic messaging that will get updated based on the api response'
  );

  /**
   * TODO: Replace with real API request
   */
  const handleAddEdit = async (requestValues: BankFormFields) => {
    setStep(FormSteps.LOADING);
    const { data, error } = await addEditBankRequest({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      partyId,
      bankId,
      formMode: mode,
      bankAccountChangeRequest: {
        bankAccount: {
          ...requestValues,
          accountStatus: AccountStatus.ACTIVEBANKACCOUNT,
          nameOnAccount: user?.name,
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
      if (mode === FormMode.EDIT) {
        updateBpmAction({
          actionType: ActionTypes.EDIT,
          bankAccountNumber: requestValues.accountNumber,
          changes: [
            {
              fieldName: 'branchName',
              value: requestValues.branchName,
            },
            {
              fieldName: 'accountType',
              value: requestValues.accountType,
            },
          ],
        });
      } else {
        updateBpmAction({
          actionType: ActionTypes.ADD,
          bankAccountNumber: requestValues.accountNumber,
        });
      }
      return;
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
          <a href={`tel:${EVERLY_CONTACT_PHONE_NUMBER}`}>
            {EVERLY_CONTACT_PHONE_NUMBER}
          </a>
        </span>
      );
      setStep(FormSteps.ERROR);
      return;
    }

    setStep(FormSteps.REMOVE_CONFIRM);
  };

  const handleRemove = async () => {
    setStep(FormSteps.LOADING);
    const { data, error } = await putEndDateBankAccount({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      partyId,
      bankId,
      bankAccountChangeRequest: {
        bankAccount: {
          ...values,
          accountStatus: AccountStatus.ACTIVEBANKACCOUNT,
          nameOnAccount: user?.name,
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
      updateBpmAction({
        actionType: ActionTypes.REMOVE,
        bankAccountNumber: values?.accountNumber,
      });
      return;
    }
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
          bankNickname={values?.branchName}
          cancelCallback={() => setOpen(false)}
          confirmCallback={handleRemove}
        />
      )}
      {step === FormSteps.LOADING && <Loading />}
      {step === FormSteps.ERROR && (
        <Error
          errorTitle={errorTitle}
          isServerError={isServerError}
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
