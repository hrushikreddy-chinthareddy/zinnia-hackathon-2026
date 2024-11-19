'use client';

import { AccountStatus } from '@zinnia/api-types/types/sor';
import { SideSheet, Button, Icon, IconType } from '@zinnia/bloom/components';
import { useParams, useSearchParams } from 'next/navigation';
import { FC, ReactNode, useEffect, useState } from 'react';

import { addBankRequest } from '@/actions/bpm-actions';
import { ActionTypes, useBpmStore } from '@/store/store';
import { BankFormFields, FormSteps } from '@/types/bank';

import styles from './AddBankSidesheet.module.css';
import { AddBank } from './form-steps/add/AddBank';
import { Error } from './form-steps/error/Error';
import { Loading } from './form-steps/loading/Loading';
import { Success } from './form-steps/success/Success';

export interface AddBankSidesheet {
  partyId: string;
  bankId?: string;
  values?: BankFormFields;
  autopayEnabled?: boolean;
  numberOfAccounts?: number;
  policyOwner: string;
}

export const AddBankSidesheet: FC<AddBankSidesheet> = ({
  values,
  partyId,
  bankId,
  policyOwner,
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

  const search = useSearchParams();

  useEffect(() => {
    if (search.get('addBank') === 'true') {
      setOpen(true);
    }
  }, [search]);

  const handleAdd = async (requestValues: BankFormFields) => {
    setStep(FormSteps.LOADING);
    const { data, error } = await addBankRequest({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      partyId,
      bankId,
      bankAccountChangeRequest: {
        bankAccount: {
          ...requestValues,
          accountStatus: AccountStatus.ACTIVEBANKACCOUNT,
          nameOnAccount: policyOwner,
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
      closeCallback={() => setOpen(false)}
      trigger={
        <Button
          className={styles.addBank as string}
          size="small"
          mode="link"
          onClick={() => setOpen(true)}
        >
          <Icon small type={IconType.ADD} />
          Add another bank account
        </Button>
      }
    >
      {!step && (
        <AddBank
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
