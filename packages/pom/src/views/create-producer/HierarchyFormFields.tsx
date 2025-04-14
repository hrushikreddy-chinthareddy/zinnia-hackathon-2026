import {
  Button,
  FieldData,
  FieldSize,
  FieldStatus,
  Icon,
  IconType,
  Label,
} from '@zinnia/bloom/components';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
  UseFieldArrayReturn,
} from 'react-hook-form';
import { FieldDate } from '../../components/date/FieldDate';
import { standardDateMonthDayYear } from '@zinnia/utils';
import styles from './CreateProducerForm.module.css';
import { ProducerFormData } from './types';

interface HierarchyFormFieldsProps {
  register: UseFormRegister<ProducerFormData>;
  errors: FieldErrors<ProducerFormData>;
  control: Control<ProducerFormData>;
  watch: UseFormWatch<ProducerFormData>;
  fieldArray: UseFieldArrayReturn<
    ProducerFormData,
    'hierarchy.uplineProducersInformation',
    'id'
  >;
}

export const HierarchyFormFields = ({
  register,
  errors,
  control,
  watch,
  fieldArray,
}: HierarchyFormFieldsProps) => {
  const { fields, append, remove } = fieldArray;

  const handleAddHierarchy = () => {
    append({
      lookupId: '',
      level: '',
    });
  };

  return (
    <>
      <FieldData
        className={styles.producerLookupId}
        style={{ width: '200px' }}
        fieldSize={FieldSize.Small}
        label={<Label>Producer Lookup ID</Label>}
        {...register(`hierarchy.producerLookupId`)}
        value={watch('nationalProducerNumber') || ''}
        readOnly={true}
      />
      <FieldData
        style={{ width: '200px' }}
        fieldSize={FieldSize.Small}
        type="number"
        label={<Label>Level of producer</Label>}
        {...register(`hierarchy.level`, {
          required: 'Level of producer is missing',
        })}
        errorMessage={errors.hierarchy?.level?.message}
        fieldStatus={
          errors.hierarchy?.level ? FieldStatus.ERROR : FieldStatus.DEFAULT
        }
      />
      <div style={{ width: '200px' }}>
        <Controller
          control={control}
          name="hierarchy.effectiveDate"
          rules={{
            required: 'Effective date is missing.',
          }}
          render={({ field }) => (
            <FieldDate
              label={
                <Label labelFor="field-input-effective-date">
                  Effective date
                </Label>
              }
              value={field.value}
              name="hierarchy.effectiveDate"
              onDateSelect={date =>
                field.onChange(standardDateMonthDayYear(date))
              }
              fieldStatus={
                errors.hierarchy?.effectiveDate
                  ? FieldStatus.ERROR
                  : FieldStatus.DEFAULT
              }
              errorMessage={errors.hierarchy?.effectiveDate?.message}
            />
          )}
        />
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className={styles.hierarchyItem}>
          <div className={styles.hierarchyContainer}>
            <div className={styles.hierarchyRow}>
              <FieldData
                style={{ width: '200px' }}
                fieldSize={FieldSize.Small}
                label={<Label>Next Party in Hierarchy</Label>}
                {...register(
                  `hierarchy.uplineProducersInformation.${index}.lookupId`
                )}
              />
              <Button
                mode="link"
                size="small"
                onClick={() => remove(index)}
                className={styles.removeButton}
              >
                <Icon type={IconType.TRASH} small width={16} height={16} />
                Remove
              </Button>
            </div>

            <FieldData
              style={{ width: '200px' }}
              fieldSize={FieldSize.Small}
              label={<Label>Level</Label>}
              type="number"
              {...register(
                `hierarchy.uplineProducersInformation.${index}.level`
              )}
            />
          </div>
        </div>
      ))}
      <div>
        <Button mode="link" size="small" onClick={handleAddHierarchy}>
          <Icon type={IconType.ADD} small />
          Add Hierarchy
        </Button>
      </div>
    </>
  );
};
