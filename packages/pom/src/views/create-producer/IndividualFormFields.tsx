import { FieldDataActive, FieldStatus, Label } from '@zinnia/bloom/components';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { FieldDate } from '../../components/date/FieldDate';
import { standardDateMonthDayYear, VALID_EMAIL_REGEX } from '@zinnia/utils';
import styles from './CreateProducerForm.module.css';
import { ProducerFormData } from './types';

interface IndividualFormFieldsProps {
  register: UseFormRegister<ProducerFormData>;
  errors: FieldErrors<ProducerFormData>;
  control: Control<ProducerFormData>;
}

export const IndividualFormFields = ({
  register,
  errors,
  control,
}: IndividualFormFieldsProps) => {
  return (
    <>
      <div className={styles.individualNameFormFields}>
        <FieldDataActive
          style={{ width: '200px' }}
          fieldSize="small"
          label={<Label>First name</Label>}
          {...register('firstName', {
            required: 'First name is missing.',
          })}
          errorMessage={errors.firstName?.message}
          fieldStatus={
            errors.firstName ? FieldStatus.ERROR : FieldStatus.DEFAULT
          }
        />
        <FieldDataActive
          style={{ width: '200px' }}
          fieldSize="small"
          label={<Label>Last name</Label>}
          {...register('lastName', {
            required: 'Last name is missing.',
          })}
          errorMessage={errors.lastName?.message}
          fieldStatus={
            errors.lastName ? FieldStatus.ERROR : FieldStatus.DEFAULT
          }
        />
      </div>

      <FieldDataActive
        style={{ width: '200px' }}
        fieldSize="small"
        label={<Label>National Producer Number</Label>}
        {...register('nationalProducerNumber', {
          required: 'National producer number is missing.',
          maxLength: {
            value: 8,
            message: 'National producer number must be exactly 8 characters.',
          },
          minLength: {
            value: 8,
            message: 'National producer number must be exactly 8 characters.',
          },
          validate: {
            validFormat: value => {
              if (value && value.length !== 8) {
                return 'National producer number must be exactly 8 characters.';
              }
              return true;
            },
          },
        })}
        errorMessage={errors.nationalProducerNumber?.message}
        fieldStatus={
          errors.nationalProducerNumber
            ? FieldStatus.ERROR
            : FieldStatus.DEFAULT
        }
      />

      <div style={{ width: '150px' }}>
        <Controller
          control={control}
          name="dateOfBirth"
          rules={{
            required: 'Date of birth is missing.',
          }}
          render={({ field }) => (
            <FieldDate
              label={
                <Label labelFor="field-input-date-of-birth">
                  Date of birth
                </Label>
              }
              name="dateOfBirth"
              onDateSelect={date =>
                field.onChange(standardDateMonthDayYear(date))
              }
              fieldStatus={
                errors.dateOfBirth ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              errorMessage={errors.dateOfBirth?.message}
            />
          )}
        />
      </div>

      <FieldDataActive
        className={styles.formField}
        fieldSize="small"
        label={<Label>Email</Label>}
        {...register('email', {
          required: 'Email is missing.',
          pattern: {
            value: VALID_EMAIL_REGEX,
            message: 'Invalid email address',
          },
        })}
        errorMessage={errors.email?.message}
        fieldStatus={errors.email ? FieldStatus.ERROR : FieldStatus.DEFAULT}
      />
    </>
  );
};
