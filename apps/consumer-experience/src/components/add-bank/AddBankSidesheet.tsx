'use client';

import { AccountStatus } from '@zinnia/api-types/types/sor';
import { SideSheet, Icon, IconType } from '@zinnia/bloom/components';
import { useParams, useSearchParams } from 'next/navigation';
import { FC, ReactNode, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { addBankRequest } from '@/actions/bpm/bank-actions';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';
import { ActionTypes, PropertyKeys, useBpmStore } from '@/store/store';
import { BankFormFields } from '@/types/bank';
import { FormSteps } from '@/types/transactions';

import styles from './AddBankSidesheet.module.css';
import { ButtonWithAnalytics } from '../button-with-analytics/ButtonWithAnalytics';
import { AddBank } from './form-steps/add/AddBank';
import { Error } from '../transaction-steps/error/Error';
import { Loading } from '../transaction-steps/loading/Loading';
import { Success } from '../transaction-steps/success/Success';
import { VerifyIdentity } from '../transaction-steps/verify-identity/VerifyIdentity';

export interface AddBankSidesheet {
  partyId: string;
  bankId?: string;
  values?: BankFormFields;
  autopayEnabled?: boolean;
  numberOfAccounts?: number;
  policyOwner: string;
}

export const AddBankSidesheet: FC<AddBankSidesheet> = ({
  partyId,
  policyOwner,
}) => {
  const requiresIdentityCode = useNeedsVerificationCode();
  const updateBpmAction = useBpmStore(state => state.updateBpmAction);
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FormSteps>();
  const [errorTitle, setErrorTitle] = useState('An error occurred');
  const [errorMessage, setErrorMessage] = useState<ReactNode>(
    'Something went wrong. Please try again.'
  );
  const [isServerError, setIsServerError] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Success!');
  const [successMessage, setSuccessMessage] = useState(
    'Your request has been submitted.'
  );
  const [requestValues, setRequestValues] = useState<BankFormFields | null>(
    null
  );

  const search = useSearchParams();
  const correlationId = uuidv4();

  useEffect(() => {
    if (search.get('addBank') === 'true') {
      setOpen(true);
    }
  }, [search]);

  const confirmAdd = (requestValues: BankFormFields) => {
    setRequestValues(requestValues);
    if (requiresIdentityCode) {
      setStep(FormSteps.VERIFY_IDENTITY);
      return;
    }

    handleAdd();
  };

  const handleAdd = async () => {
    setStep(FormSteps.LOADING);

    const { data, error } = await addBankRequest({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      partyId,
      correlationId,
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
        propertyKey: PropertyKeys.BANK_DETAILS,
        itemKey: 'routingNumber',
        itemValue: requestValues?.routingNumber,
      });
      return;
    }
  };

  const onClose = () => {
    setOpen(false);
    setStep(undefined);

    // Timeout is here to prevent the flash of the internal sidesheet component from showing
    // as the animation happens
    setTimeout(() => {
      setStep(undefined);
    }, 300);
  };

  const addBankFail = () => {
    setStep(FormSteps.ERROR);
  };

  return (
    <SideSheet
      header="Add New Bank Account"
      overrideOpen={open}
      closeCallback={onClose}
      trigger={
        <ButtonWithAnalytics
          className={styles.addBank as string}
          size="small"
          mode="link"
          onClick={() => setOpen(true)}
        >
          <Icon small type={IconType.ADD} />
          Add a bank account
        </ButtonWithAnalytics>
      }
    >
      {!step && (
        <AddBank
          cancelCallback={onClose}
          submitCallback={handleAdd}
          correlationId={correlationId}
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
      {step === FormSteps.VERIFY_IDENTITY && (
        <VerifyIdentity
          closeCallback={onClose}
          onSuccess={handleAdd}
          onFailure={addBankFail}
          transactionDescription="managing your bank account."
        />
      )}
    </SideSheet>
  );
};
