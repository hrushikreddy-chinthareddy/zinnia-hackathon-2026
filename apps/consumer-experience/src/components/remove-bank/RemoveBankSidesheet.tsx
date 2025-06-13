'use client';

import { SideSheet, Icon, IconType } from '@zinnia/bloom/components';
import { FC, ReactNode, useState } from 'react';

import { Button } from '@/components/button/Button';
import { useNeedsVerificationCode } from '@/hooks/use-needs-verification-code';
import { ApiResponseError } from '@/services';
import { BankFormFields } from '@/types/bank';
import { FormSteps } from '@/types/transactions';

import { Error } from './form-steps/error/Error';
import { Loading } from './form-steps/loading/Loading';
import { RemoveBankConfirm } from './form-steps/remove-bank-confirm/RemoveBankConfirm';
import { Success } from './form-steps/success/Success';
import { VerifyIdentity } from '../transaction-steps/verify-identity/VerifyIdentity';
import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

export interface RemoveBankProps {
  values?: Omit<BankFormFields, 'accountType'> & {
    accountType?: string;
  };
  autopayEnabled?: boolean;
  numberOfAccounts?: number;
  onRemoveBank: () => Promise<{
    data: { title: string; message: string };
    error: ApiResponseError | null;
  }>;
  checkVerification?: boolean;
}

export const RemoveBankSidesheet: FC<RemoveBankProps> = ({
  values,
  autopayEnabled,
  numberOfAccounts,
  onRemoveBank,
  checkVerification = true,
}) => {
  const requiresIdentityCode = useNeedsVerificationCode();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FormSteps>();
  const [errorTitle, setErrorTitle] = useState('An error occurred');
  const [errorMessage, setErrorMessage] = useState<ReactNode>(
    'Something went wrong. Please try again.'
  );
  const [isServerError, setIsServerError] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Success!');
  const [successMessage, setSuccessMessage] = useState(
    'Something went wrong. Please try again.'
  );

  const checkVerificationAndRemove = async () => {
    if (requiresIdentityCode && checkVerification) {
      setStep(FormSteps.VERIFY_IDENTITY);
      return;
    }

    handleRemove();
  };

  const handleRemove = async () => {
    setStep(FormSteps.LOADING);
    const { data, error } = await onRemoveBank();

    if (error) {
      setIsServerError(error.status >= 500);
      setErrorTitle(error.name);
      setErrorMessage(error.message);
      setStep(FormSteps.ERROR);
      return;
    }
    if (data) {
      setSuccessTitle(data.title);
      setSuccessMessage(data.message);
      setStep(FormSteps.SUCCESS);
      return;
    }
  };

  const onClose = () => {
    setOpen(false);
    setStep(undefined);
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
              To manage your autopay details, call us at <CarrierPhoneNumber />
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
          onFailure={() => setStep(FormSteps.ERROR)}
          transactionDescription="managing your bank account."
        />
      );
    }

    if (step === FormSteps.ERROR) {
      return (
        <Error
          errorTitle={errorTitle}
          isServerError={true}
          errorMessage={errorMessage}
          closeCallback={onClose}
        />
      );
    }

    return (
      <RemoveBankConfirm
        accountNumber={values?.accountNumber}
        bankNickname={values?.branchName}
        cancelCallback={onClose}
        confirmCallback={checkVerificationAndRemove}
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
