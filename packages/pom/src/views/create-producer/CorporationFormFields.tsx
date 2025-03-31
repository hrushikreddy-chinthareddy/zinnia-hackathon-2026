import {
  FieldDataActive,
  FieldStatus,
  Label,
  Select,
} from '@zinnia/bloom/components';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { Channel, CorporationType } from '../../types';
import styles from './CreateProducerForm.module.css';
import { ProducerFormData } from './types';
import { formatEnumValue } from './utils';
import { VALID_EMAIL_REGEX } from '@zinnia/utils';

interface CorporationFormFieldsProps {
  register: UseFormRegister<ProducerFormData>;
  errors: FieldErrors<ProducerFormData>;
  control: Control<ProducerFormData>;
}

export const CorporationFormFields = ({
  register,
  errors,
  control,
}: CorporationFormFieldsProps) => {
  return (
    <>
      <FieldDataActive
        className={styles.formField}
        fieldSize="small"
        label={<Label>Full name</Label>}
        {...register('fullName', {
          required: 'Full name is missing.',
        })}
        errorMessage={errors.fullName?.message}
        fieldStatus={errors.fullName ? FieldStatus.ERROR : FieldStatus.DEFAULT}
      />

      <FieldDataActive
        style={{ width: '200px' }}
        fieldSize="small"
        label={<Label>National Producer Number</Label>}
        {...register('nationalProducerNumber', {
          required: 'National producer number is missing.',
          pattern: {
            value: /^\d{1,10}$/,
            message:
              'National producer number must be a number up to 10 digits',
          },
        })}
        errorMessage={errors.nationalProducerNumber?.message}
        fieldStatus={
          errors.nationalProducerNumber
            ? FieldStatus.ERROR
            : FieldStatus.DEFAULT
        }
      />

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

      <Controller
        name="corporationType"
        control={control}
        rules={{ required: 'Type of Corporation is missing.' }}
        render={({ field }) => (
          <div className={styles.formField}>
            <Select
              id="field-select-corporation-type"
              fieldSize="small"
              label={
                <Label labelFor="field-select-corporation-type">
                  Type of Corporation
                </Label>
              }
              placeholder="-- Select type of corporation --"
              value={field.value}
              onValueChange={field.onChange}
              errorMessage={errors.corporationType?.message}
              fieldStatus={
                errors.corporationType ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              options={Object.values(CorporationType).map(type => ({
                textValue: formatEnumValue(type),
                value: type,
              }))}
            />
          </div>
        )}
      />

      <Controller
        name="channel"
        control={control}
        rules={{ required: 'Channel is missing.' }}
        render={({ field }) => (
          <div className={styles.formField}>
            <Select
              id="field-select-channel"
              fieldSize="small"
              label={<Label labelFor="field-select-channel">Channel</Label>}
              placeholder="-- Select channel --"
              value={field.value}
              onValueChange={field.onChange}
              errorMessage={errors.channel?.message}
              fieldStatus={
                errors.channel ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              options={Object.values(Channel).map(type => ({
                textValue: formatEnumValue(type),
                value: type,
              }))}
            />
          </div>
        )}
      />
    </>
  );
};
