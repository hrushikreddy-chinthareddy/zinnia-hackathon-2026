'use client';

import { AccountStatus } from '@zinnia/api-types/types/sor';
import { SideSheet, Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useParams } from 'next/navigation';
import { FC, ReactNode, useState } from 'react';

import { addBankRequest } from '@/actions/bpm-actions';
import { useUser } from '@/hooks/use-user';
import { ActionTypes, useBpmStore } from '@/store/store';

import styles from './AddBankSidesheet.module.css';
import { AddBank } from './form-steps/add/AddBank';
import { Error } from './form-steps/error/Error';
import { Loading } from './form-steps/loading/Loading';
import { Success } from './form-steps/success/Success';
import { BankFormFields, FormMode, FormSteps } from './shared-types';

export interface AddBankSidesheet {
  mode: FormMode;
  partyId: string;
  bankId?: string;
  values?: BankFormFields;
  autopayEnabled?: boolean;
  numberOfAccounts?: number;
}

export const AddBankSidesheet: FC<AddBankSidesheet> = ({
  mode,
  values,
  partyId,
  bankId,
}) => {
  const updateBpmAction = useBpmStore(state => state.updateBpmAction);
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const [step, setStep] = useState<FormSteps>(FormSteps.ADD);
  const [errorTitle, setErrorTitle] = useState('An error occurred');
  const [errorMessage, setErrorMessage] = useState<ReactNode>(
    'Some generic messaging that will get updated based on the api response'
  );
  const [isServerError, setIsServerError] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Success!');
  const [successMessage, setSuccessMessage] = useState(
    'Some generic messaging that will get updated based on the api response'
  );

  const handleAdd = async (requestValues: BankFormFields) => {
    setStep(FormSteps.LOADING);
    const { data, error } = await addBankRequest({
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

      updateBpmAction({
        actionType: ActionTypes.ADD,
        bankAccountNumber: requestValues.accountNumber,
      });
      return;
    }
  };

  return (
    <SideSheet
      header="Add New Bank Account"
      overrideOpen={open}
      closeCallback={() => setStep(FormSteps.ADD)}
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
          Add another bank account
        </Button>
      }
    >
      {step === FormSteps.ADD && (
        <AddBank
          mode={mode}
          values={values}
          cancelCallback={() => setOpen(false)}
          submitCallback={handleAdd}
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
