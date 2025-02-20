'use client';

import { AccountStatus } from '@zinnia/api-types/types/sor';
import { SideSheet, Button, Icon, IconType } from '@zinnia/bloom/components';
import { useParams } from 'next/navigation';
import { FC, ReactNode, useState } from 'react';

import { putEndDateBankAccount } from '@/actions/bpm/bank-actions';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { useUser } from '@/hooks/use-user';
import { ActionTypes, PropertyKeys, useBpmStore } from '@/store/store';
import { BankFormFields } from '@/types/bank';
import { FormSteps } from '@/types/transactions';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { Error } from './form-steps/error/Error';
import { Loading } from './form-steps/loading/Loading';
import { RemoveBankConfirm } from './form-steps/remove-bank-confirm/RemoveBankConfirm';
import { Success } from './form-steps/success/Success';
import { VerifyIdentity } from '../transaction-steps/verify-identity/VerifyIdentity';

export interface RemoveBankProps {
  partyId: string;
  bankId?: string;
  values?: BankFormFields;
  autopayEnabled?: boolean;
  numberOfAccounts?: number;
}

export const RemoveBankSidesheet: FC<RemoveBankProps> = ({
  values,
  partyId,
  bankId,
  autopayEnabled,
  numberOfAccounts,
}) => {
  const { data: featureFlagData } = useFeatureFlags();
  const checkIdentityCode =
    featureFlagData?.[FEATURE_FLAGS.TRANSACTION_LEVEL_CODE_ADD_BANK];
  const updateBpmAction = useBpmStore(state => state.updateBpmAction);
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const [step, setStep] = useState<FormSteps>();
  const [, setErrorTitle] = useState('An error occurred');
  const [, setErrorMessage] = useState<ReactNode>(
    'Some generic messaging that will get updated based on the api response'
  );
  const [isServerError, setIsServerError] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Success!');
  const [successMessage, setSuccessMessage] = useState(
    'Some generic messaging that will get updated based on the api response'
  );

  const handleRemove = async () => {
    if (checkIdentityCode) {
      setStep(FormSteps.VERIFY_IDENTITY);
      return;
    }

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
        propertyKey: PropertyKeys.BANK_DETAILS,
        itemKey: 'routingNumber',
        itemValue: values?.routingNumber,
      });
      return;
    }
  };

  const onClose = () => {
    setOpen(false);
  };

  const sidesheetInner = () => {
    if (numberOfAccounts === 1) {
      return (
        <Error
          errorTitle="This is the only account saved."
          isServerError={isServerError}
          errorMessage="You must have at least one banking account saved. To remove this one, first add another bank account."
          closeCallback={onClose}
        />
      );
    }

    if (autopayEnabled) {
      return (
        <Error
          errorTitle="We can't delete autopay account."
          isServerError={isServerError}
          errorMessage={
            <span>
              To manage your autopay details, call us at{' '}
              <a href={`tel:${EVERLY_CONTACT_PHONE_NUMBER}`}>
                {EVERLY_CONTACT_PHONE_NUMBER}
              </a>
            </span>
          }
          closeCallback={onClose}
        />
      );
    }

    if (step === FormSteps.LOADING) {
      return <Loading />;
    }

    if (step === FormSteps.SUCCESS) {
      return (
        <Success
          successTitle={successTitle}
          successMessage={successMessage}
          closeCallback={onClose}
        />
      );
    }

    if (step === FormSteps.VERIFY_IDENTITY) {
      return (
        <VerifyIdentity
          closeCallback={onClose}
          onSuccess={handleRemove}
          transactionDescription="managing your bank account."
        />
      );
    }

    return (
      <RemoveBankConfirm
        accountNumber={values?.accountNumber}
        bankNickname={values?.branchName}
        cancelCallback={onClose}
        confirmCallback={handleRemove}
      />
    );
  };

  const bankAccessibilityLabel = () => {
    return `Remove bank with name ${values?.branchName}`;
  };

  return (
    <SideSheet
      header="Remove Bank Account"
      overrideOpen={open}
      trigger={
        <Button
          size="small"
          mode="link"
          onClick={() => setOpen(true)}
          aria-label={bankAccessibilityLabel()}
        >
          <Icon
            type={IconType.TRASH}
            color="var(--color-base-icon-icon-action)"
          />
        </Button>
      }
    >
      {sidesheetInner()}
    </SideSheet>
  );
};
