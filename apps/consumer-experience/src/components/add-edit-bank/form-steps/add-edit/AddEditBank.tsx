'use client';
import { AccountType } from '@zinnia/api-types/types/sor';
import { Radio, Label, Button } from '@zinnia/bloom/components';
import { FC } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { isNumber } from '@/utils/regex';

import styles from './AddEditBank.module.css';
import { FieldDataActive } from '../../../field/data-active/FieldDataActive';
import { FieldStatus } from '../../../field/types';
import { BankFormFields, FormMode } from '../../shared-types';

export interface AddEditBankProps {
  mode: FormMode;
  values?: BankFormFields;
  cancelCallback?: () => void;
  submitCallback?: (val: BankFormFields) => void;
  removeCallback?: () => void;
}

export const AddEditBank: FC<AddEditBankProps> = ({
  mode,
  values,
  cancelCallback,
  submitCallback,
  removeCallback,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, defaultValues },
  } = useForm<BankFormFields>({
    defaultValues: {
      accountType: values?.accountType || AccountType.CHECKING,
      branchName: values?.branchName || '',
      routingNumber: values?.routingNumber || '',
      accountNumber: values?.accountNumber
        ? `**********${values?.accountNumber}`
        : '',
    },
  });

  const handleRemove = () => {
    removeCallback?.();
  };

  const handleCancel = () => {
    reset();
    cancelCallback?.();
  };

  const onSubmit: SubmitHandler<BankFormFields> = data => {
    submitCallback?.(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formFields}>
        <Controller
          name="accountType"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <div>
              <Radio
                id="radio-account-type"
                onValueChange={field.onChange}
                groupLabel="Account type"
                defaultValue={defaultValues?.accountType}
                options={[
                  {
                    label: 'Checking',
                    ariaLabel: 'Checking',
                    value: AccountType.CHECKING,
                  },
                  {
                    label: 'Savings',
                    ariaLabel: 'Savings',
                    value: AccountType.SAVINGS,
                  },
                ]}
              />
            </div>
          )}
        />
        <Controller
          name="branchName"
          control={control}
          rules={{ required: 'Bank nickname is missing.' }}
          render={({ field }) => (
            <div>
              <FieldDataActive
                errorMessage={errors.branchName?.message}
                fieldStatus={
                  errors.branchName ? FieldStatus.ERROR : FieldStatus.DEFAULT
                }
                label={<Label>Bank nickname</Label>}
                {...field}
              />
            </div>
          )}
        />

        <Controller
          name="routingNumber"
          control={control}
          rules={{
            required: 'Routing number is missing',
            minLength: {
              value: 9,
              message: 'Routing number must have 9 digits.',
            },
            maxLength: {
              value: 9,
              message: 'Routing number must have 9 digits.',
            },
            pattern: mode === FormMode.EDIT ? undefined : /^[0-9]+$/,
          }}
          render={({ field }) => (
            <div>
              <FieldDataActive
                {...field}
                disabled={mode === FormMode.EDIT}
                errorMessage={errors.routingNumber?.message}
                onChange={e => {
                  if (!isNumber(e.target.value)) {
                    e.preventDefault();
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
                fieldStatus={
                  errors.routingNumber ? FieldStatus.ERROR : FieldStatus.DEFAULT
                }
                label={<Label>Routing Number</Label>}
              />
            </div>
          )}
        />

        <Controller
          name="accountNumber"
          control={control}
          rules={{
            required: 'Account number is missing.',
            maxLength: {
              value: 16,
              message: "Account number can't exceed 16 digits.",
            },
            pattern: mode === FormMode.EDIT ? undefined : /^[0-9]+$/,
          }}
          render={({ field }) => (
            <div>
              <FieldDataActive
                {...field}
                disabled={mode === FormMode.EDIT}
                fieldStatus={
                  errors.accountNumber ? FieldStatus.ERROR : FieldStatus.DEFAULT
                }
                errorMessage={errors.accountNumber?.message}
                label={<Label>Account Number</Label>}
                onChange={e => {
                  if (!isNumber(e.target.value)) {
                    e.preventDefault();
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
              />
            </div>
          )}
        />
        {mode === FormMode.EDIT && (
          <p className="typography-content-body">
            To edit your routing or account number, you'll need to remove this
            account and add another bank account.
          </p>
        )}
      </div>

      <div className={styles.buttonContainer}>
        <Button type="submit">{`${mode === FormMode.ADD ? 'Save' : 'Update'} account`}</Button>
        {mode === FormMode.EDIT && (
          <Button onClick={handleRemove} className={styles.remove} mode="error">
            Remove account
          </Button>
        )}
        <Button onClick={handleCancel} className={styles.cancel} mode="link">
          Cancel
        </Button>
      </div>
    </form>
  );
};
