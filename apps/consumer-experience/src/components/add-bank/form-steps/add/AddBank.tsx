'use client';
import { AccountType } from '@zinnia/api-types/types/sor';
import { Radio, Label } from '@zinnia/bloom/components';
import { FC } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { BankFormFields } from '@/types/bank';
import { isNumber } from '@/utils/regex';

import styles from './AddBank.module.css';
import { FieldDataActive } from '../../../field/data-active/FieldDataActive';
import { FieldStatus } from '../../../field/types';
import { Button } from '@/components/button/Button';

export interface AddBankProps {
  cancelCallback?: () => void;
  submitCallback?: (val: BankFormFields) => void;
  correlationId?: string;
}

export const AddBank: FC<AddBankProps> = ({
  cancelCallback,
  submitCallback,
  correlationId,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, defaultValues },
  } = useForm<BankFormFields>({
    defaultValues: {
      accountType: AccountType.CHECKING,
      branchName: '',
      routingNumber: '',
      accountNumber: '',
    },
  });

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
            pattern: /^[0-9]+$/,
          }}
          render={({ field }) => (
            <div>
              <FieldDataActive
                {...field}
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
            pattern: /^[0-9]+$/,
          }}
          render={({ field }) => (
            <div>
              <FieldDataActive
                {...field}
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
      </div>

      <div className={styles.buttonContainer}>
        {/* TODO: right now this will track the click regardless of whether
        the form has errors or not. possibly change when the analytics
        happens and doi it on SubmitHandler instead */}
        <Button type="submit" correlationId={correlationId}>
          Save account
        </Button>
        <Button onClick={handleCancel} className={styles.cancel} mode="link">
          Cancel
        </Button>
      </div>
    </form>
  );
};
