'use client';
import { AddressType } from '@zinnia/api-types/types/sor';
import { Radio, Label, Button, Checkbox } from '@zinnia/bloom/components';
import { FC } from 'react';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import styles from './AddAddress.module.css';
import { FieldDataActive } from '../../../field/data-active/FieldDataActive';
import { FieldStatus } from '../../../field/types';

export interface AddressObj {
  addressVal: string;
}
export interface AddressFormFields {
  addressType: AddressType;
  addresses: AddressObj[];
  city: string;
  state: string;
  zipCode: string;
  defaultAddress: boolean;
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

  console.log({ defaultValues });
  console.log({ fields });

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
          const errorIndex = errors['addresses']?.[index];
          return (
            <Controller
              name={`addresses.${index}`}
              control={control}
              key={field.id}
              rules={{ required: `Address Line ${index + 1} is missing.` }}
              render={({ field }) => (
                <div>
                  <FieldDataActive
                    errorMessage={errorIndex?.message}
                    fieldStatus={
                      errorIndex ? FieldStatus.ERROR : FieldStatus.DEFAULT
                    }
                    label={<Label>Address Line {index + 1}</Label>}
                    {...field}
                    value={field.value.addressVal}
                  />
                </div>
              )}
            />
          );
        })}

        <button type="button" onClick={() => append({ addressVal: '' })}>
          Add address
        </button>

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

        <div className="flex gap-4">
          <Controller
            name="state"
            control={control}
            rules={{ required: 'State is missing.' }}
            render={({ field }) => (
              <div>
                <FieldDataActive
                  errorMessage={errors.state?.message}
                  fieldStatus={
                    errors.city ? FieldStatus.ERROR : FieldStatus.DEFAULT
                  }
                  label={<Label>State</Label>}
                  {...field}
                />
              </div>
            )}
          />

          <Controller
            name="zipCode"
            control={control}
            rules={{ required: 'Zip is missing.' }}
            render={({ field }) => (
              <div>
                <FieldDataActive
                  errorMessage={errors.zipCode?.message}
                  fieldStatus={
                    errors.zipCode ? FieldStatus.ERROR : FieldStatus.DEFAULT
                  }
                  label={<Label>Zip</Label>}
                  {...field}
                />
              </div>
            )}
          />

          <Controller
            name="defaultAddress"
            control={control}
            render={({ field }) => (
              <div>
                <Checkbox
                  id="checkbox-default-address"
                  onChange={field.onChange}
                  label="Default Address"
                />
              </div>
            )}
          />
        </div>
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
