'use client';

import { AccountStatus } from '@zinnia/api-types/types/sor';
import { SideSheet, Button, Icon, IconType } from '@zinnia/bloom/components';
import { useParams, useSearchParams } from 'next/navigation';
import { FC, ReactNode, useEffect, useState } from 'react';

import { addBankRequest } from '@/actions/bpm/bank-actions';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { useUser } from '@/hooks/use-user';
import { ActionTypes, PropertyKeys, useBpmStore } from '@/store/store';
import { BankFormFields } from '@/types/bank';
import { FormSteps } from '@/types/transactions';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './AddBankSidesheet.module.css';
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
  const { user } = useUser();
  const { data: featureFlagData } = useFeatureFlags();
  const checkIdentityCode =
    featureFlagData?.[FEATURE_FLAGS.TRANSACTION_LEVEL_CODE_ADD_BANK];
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
    // TODO: add check here to accessToken for property CIAM is adding?
    console.log(user);
    if (checkIdentityCode) {
      setStep(FormSteps.VERIFY_IDENTITY);
      return;
    }

    const { data, error } = await addBankRequest({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      partyId,
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
        itemValue: requestValues.routingNumber,
      });
      return;
    }
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
      header="Add New Bank Account"
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
          Add another bank account
        </Button>
      }
    >
      {!step && <AddBank cancelCallback={onClose} submitCallback={handleAdd} />}
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
          transactionDescription="managing your bank account."
        />
      )}
    </SideSheet>
  );
};
