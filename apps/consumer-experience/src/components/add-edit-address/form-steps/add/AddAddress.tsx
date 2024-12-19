'use client';
import { AddressType } from '@zinnia/api-types/types/sor';
import {
  Radio,
  Label,
  Button,
  Checkbox,
  Icon,
  IconType,
  Select,
} from '@zinnia/bloom/components';
import { FC } from 'react';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { isNumber } from '@/utils/regex';
import { states } from '@/utils/states';

import styles from './AddAddress.module.css';
import { FieldDataActive } from '../../../field/data-active/FieldDataActive';
import { FieldStatus } from '../../../field/types';

export interface AddressObj {
  addressVal: string;
}
export interface AddressFormFields {
  addressType?: AddressType;
  addresses?: AddressObj[];
  city?: string;
  state?: string;
  zipCode?: string;
  defaultAddress?: boolean;
}

export interface AddAddressProps {
  values?: AddressFormFields;
  cancelCallback?: () => void;
  submitCallback?: (val: AddressFormFields) => void;
  removeCallback?: () => void;
}

export const AddAddress: FC<AddAddressProps> = ({
  values,
  cancelCallback,
  submitCallback,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, defaultValues },
  } = useForm<AddressFormFields>({
    defaultValues: {
      addressType: values?.addressType || AddressType.RESIDENCE,
      addresses: values?.addresses || [{ addressVal: '' }],
      city: values?.city || '',
      state: values?.state || '',
      zipCode: values?.zipCode || '',
      defaultAddress: values?.defaultAddress || false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  });

  const handleCancel = () => {
    reset();
    cancelCallback?.();
  };

  const onSubmit: SubmitHandler<AddressFormFields> = data => {
    submitCallback?.(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formFields}>
        <Controller
          name="addressType"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <div>
              <Radio
                id="radio-address-type"
                onValueChange={field.onChange}
                groupLabel="Type"
                defaultValue={defaultValues?.addressType}
                options={[
                  {
                    label: 'Residential',
                    ariaLabel: 'Residential',
                    value: AddressType.RESIDENCE,
                  },
                  {
                    label: 'Business',
                    ariaLabel: 'Business',
                    value: AddressType.BUSINESS,
                  },
                  {
                    label: 'PO Box',
                    ariaLabel: 'PO Box',
                    value: AddressType.POBOX,
                  },
                ]}
              />
            </div>
          )}
        />

        {fields.map((field, index) => {
          const error = errors['addresses']?.[index]?.addressVal;

          return (
            <div key={field.id} className={styles.addressWrapper}>
              <Controller
                name={`addresses.${index}.addressVal`}
                control={control}
                rules={{
                  required: `Address Line ${index + 1} is missing.`,
                }}
                render={({ field }) => (
                  <div className={styles.addressField}>
                    <FieldDataActive
                      errorMessage={error?.message}
                      fieldStatus={
                        error ? FieldStatus.ERROR : FieldStatus.DEFAULT
                      }
                      label={<Label>Address Line {index + 1}</Label>}
                      {...field}
                      value={field.value}
                    />
                  </div>
                )}
              />
              {index > 0 && (
                <Button
                  mode="link"
                  className={styles.trashIcon}
                  onClick={() => remove(index)}
                >
                  <Icon small type={IconType.TRASH} />
                </Button>
              )}
            </div>
          );
        })}
        {fields.length < 3 && (
          <Button
            type="button"
            mode="link"
            className={styles.addAddressButton}
            onClick={() => append({ addressVal: '' })}
          >
            <Icon type={IconType.ADD} /> Add address line (e.g. unit, floor,
            suite, etc)
          </Button>
        )}

        <Controller
          name="city"
          control={control}
          rules={{ required: 'City is missing.' }}
          render={({ field }) => (
            <div>
              <FieldDataActive
                errorMessage={errors.city?.message}
                fieldStatus={
                  errors.city ? FieldStatus.ERROR : FieldStatus.DEFAULT
                }
                label={<Label>City</Label>}
                {...field}
              />
            </div>
          )}
        />

        <div className={styles.stateZipRow}>
          <Controller
            name="state"
            control={control}
            rules={{ required: 'Select state' }}
            render={({ field }) => (
              <div className={styles.state}>
                {/* TODO: Remove label and add to prop when bloom updates */}
                <Label labelFor="select-state">State</Label>
                <Select
                  id="select-state"
                  onValueChange={field.onChange}
                  options={states}
                  errorMessage={errors.state?.message}
                  contentClassName={styles.selectContent}
                  fieldSize="small"
                  fieldStatus={
                    errors.state ? FieldStatus.ERROR : FieldStatus.DEFAULT
                  }
                />
              </div>
            )}
          />

          <Controller
            name="zipCode"
            control={control}
            rules={{
              required: 'ZIP code must be between 5 and 9 digits.',
              minLength: {
                value: 5,
                message: 'ZIP code must be between 5 and 9 digits.',
              },
              maxLength: {
                value: 9,
                message: 'ZIP code must be between 5 and 9 digits.',
              },
              pattern: {
                value: /^[0-9]+$/,
                message: 'Zip must be a number.',
              },
            }}
            render={({ field }) => (
              <div className={styles.zip}>
                <FieldDataActive
                  errorMessage={errors.zipCode?.message}
                  fieldStatus={
                    errors.zipCode ? FieldStatus.ERROR : FieldStatus.DEFAULT
                  }
                  label={<Label>Zip</Label>}
                  {...field}
                  onChange={e => {
                    if (!isNumber(e.target.value) && e.target.value !== '') {
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
        <Controller
          name="defaultAddress"
          control={control}
          render={({ field }) => (
            <div className={styles.defaultAddress}>
              <Checkbox
                id="checkbox-default-address"
                onChange={field.onChange}
                isCheckedByDefault={field.value}
              >
                {' '}
                Set this address as my mailing address
              </Checkbox>
            </div>
          )}
        />
      </div>

      <div className={styles.buttonContainer}>
        <Button type="submit">Save address</Button>
        <Button onClick={handleCancel} className={styles.cancel} mode="link">
          Cancel
        </Button>
      </div>
    </form>
  );
};
