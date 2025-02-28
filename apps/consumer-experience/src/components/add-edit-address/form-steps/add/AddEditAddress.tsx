'use client';
import { AddressChange } from '@zinnia/api-types/types/bpm';
import {
  Radio,
  Label,
  Button,
  Checkbox,
  Icon,
  IconType,
} from '@zinnia/bloom/components';
import { FC } from 'react';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { ButtonWithAnalytics } from '@/components/button-with-analytics/ButtonWithAnalytics';
import { SelectResponsive } from '@/components/select-responsive/SelectResponsive';
import { getDirtyValues } from '@/utils/forms';
import { isNumberOrHyphen } from '@/utils/regex';
import { states } from '@/utils/states';

import styles from './AddEditAddress.module.css';
import { FieldDataActive } from '../../../field/data-active/FieldDataActive';
import { FieldStatus } from '../../../field/types';
import { FormActionType } from '../../types';

export interface AddressObj {
  addressVal: string;
}
export interface AddressFormFields {
  addressType?: AddressChange.addressType;
  addresses?: AddressObj[];
  city?: string;
  state?: AddressChange.state;
  zipCode?: string;
  defaultAddress?: boolean;
}

export interface AddEditAddressProps {
  values?: AddressFormFields;
  actionType?: FormActionType;
  cancelCallback?: () => void;
  submitCallback?: (
    val: AddressFormFields,
    dirtyFields: AddressFormFields
  ) => void;
  removeCallback?: () => void;
  /**
   * If the user only has one address, we need to prevent editing the preferred address setting
   */
  disableEditingPreferredAddress?: boolean;
}
export const AddEditAddress: FC<AddEditAddressProps> = ({
  values,
  cancelCallback,
  submitCallback,
  removeCallback,
  actionType,
  disableEditingPreferredAddress,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, defaultValues, dirtyFields },
  } = useForm<AddressFormFields>({
    defaultValues: {
      addressType: values?.addressType || AddressChange.addressType.RESIDENCE,
      addresses: values?.addresses || [{ addressVal: '' }],
      city: values?.city || '',
      state: values?.state || undefined,
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
    const values = getValues();
    const dirtyValues = getDirtyValues(dirtyFields, values);
    submitCallback?.(data, dirtyValues);
  };

  const buttonText =
    actionType === FormActionType.ADD ? 'Save address' : 'Update address';

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
                    value: AddressChange.addressType.RESIDENCE,
                  },
                  {
                    label: 'Business',
                    ariaLabel: 'Business',
                    value: AddressChange.addressType.BUSINESS,
                  },
                  {
                    label: 'PO Box',
                    ariaLabel: 'PO Box',
                    value: AddressChange.addressType.POBOX,
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
            size="small"
          >
            <Icon type={IconType.ADD} />
            Add address line (e.g.&nbsp;apt,&nbsp;, suite,&nbsp;etc)
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
                <SelectResponsive
                  id="select-state"
                  onChange={field.onChange}
                  options={states}
                  defaultValue={defaultValues?.state}
                  errorMessage={errors.state?.message}
                  fieldSize="small"
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
                value: /^[0-9-]+$/,
                message: 'Zip must be a number.',
              },
            }}
            render={({ field }) => (
              <div className={styles.zip}>
                <FieldDataActive
                  inputMode="numeric"
                  errorMessage={errors.zipCode?.message}
                  fieldStatus={
                    errors.zipCode ? FieldStatus.ERROR : FieldStatus.DEFAULT
                  }
                  label={<Label>Zip</Label>}
                  {...field}
                  onChange={e => {
                    if (
                      !isNumberOrHyphen(e.target.value) &&
                      e.target.value !== ''
                    ) {
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
                onClick={field.onChange}
                isCheckedByDefault={field.value}
                isDisabled={disableEditingPreferredAddress}
              >
                Set this address as my mailing address
              </Checkbox>
            </div>
          )}
        />
      </div>

      <div className={styles.buttonContainer}>
        <ButtonWithAnalytics type="submit">{buttonText}</ButtonWithAnalytics>
        {actionType === FormActionType.EDIT && (
          <ButtonWithAnalytics
            onClick={removeCallback}
            className={styles.delete}
            mode="error"
          >
            Remove address
          </ButtonWithAnalytics>
        )}
        <Button onClick={handleCancel} className={styles.cancel} mode="link">
          Cancel
        </Button>
      </div>
    </form>
  );
};
