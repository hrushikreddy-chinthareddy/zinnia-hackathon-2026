import { FC, useState } from 'react';
import {
  Button,
  FieldDataActive,
  FieldStatus,
  Icon,
  IconType,
  Label,
  Select,
} from '@zinnia/bloom/components';
import { PreviewStep } from '../../../../components/sidesheet/preview/PreviewStep';
import { ConfirmStep } from '../../../../components/sidesheet/confirm/ConfirmStep';
import { AddForm } from '../../../../components/sidesheet/add-form/AddForm';
import { PomSideSheet } from '../../../../components/pom-sidesheet/PomSidesheet';
import { FieldDate } from '../../../../components/date/FieldDate';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { standardDateMonthDayYear } from '@zinnia/utils';
import { StateTrainingItem } from '../../../../types/training-education.types';
import { FormSteps } from '../../../utils';

export type AddStateTrainingFormValues = Pick<
  StateTrainingItem,
  | 'vendor'
  | 'courseNumber'
  | 'courseName'
  | 'state'
  | 'hours'
  | 'completionDate'
  | 'expirationDate'
>;

export interface SideSheetContentProps {
  onSideSheetClose?: () => void;
}

const SideSheetContent: FC<SideSheetContentProps> = ({ onSideSheetClose }) => {
  const [step, setStep] = useState<FormSteps>(FormSteps.FORM);
  const [formValues, setFormValues] = useState<AddStateTrainingFormValues>();

  const stateTrainingFieldLabels: Record<
    keyof AddStateTrainingFormValues,
    string
  > = {
    vendor: 'Vendor',
    courseNumber: 'Course number',
    courseName: 'Course name',
    state: 'State',
    hours: 'Hours',
    completionDate: 'Completion date',
    expirationDate: 'Expiration date',
  };

  // Add form fields
  const formFields = ({
    control,
    errors,
  }: {
    control: Control<AddStateTrainingFormValues>;
    errors: FieldErrors<AddStateTrainingFormValues>;
  }) => ({
    vendor: (
      <Controller
        name="vendor"
        control={control}
        rules={{ required: 'Vendor is missing.' }}
        render={({ field }) => (
          <Select
            id="field-select-vendor"
            fieldSize="small"
            label={<Label labelFor="field-select-vendor">Vendor</Label>}
            value={field.value}
            onValueChange={field.onChange}
            errorMessage={errors.vendor?.message}
            fieldStatus={
              errors.vendor ? FieldStatus.ERROR : FieldStatus.DEFAULT
            }
            options={[
              {
                textValue: 'PBC Health Benefits Society',
                value: 'pbc-health-benefits-society',
              },
              {
                textValue: 'AAA Insurance',
                value: 'aaa-insurance',
              },
            ]}
          />
        )}
      />
    ),
    courseNumber: (
      <Controller
        name="courseNumber"
        control={control}
        rules={{ required: 'Course number is missing.' }}
        render={({ field }) => (
          <FieldDataActive
            style={{ width: '100px' }}
            id="field-input-courseNumber"
            fieldSize="small"
            label={
              <Label labelFor="field-input-courseNumber">
                {stateTrainingFieldLabels.courseNumber}
              </Label>
            }
            onChange={field.onChange}
            errorMessage={errors.courseNumber?.message}
            fieldStatus={
              errors.courseNumber ? FieldStatus.ERROR : FieldStatus.DEFAULT
            }
          />
        )}
      />
    ),
    courseName: (
      <Controller
        name="courseName"
        control={control}
        rules={{ required: 'Course name is missing.' }}
        render={({ field }) => (
          <FieldDataActive
            style={{ width: '150px' }}
            id="field-input-courseName"
            fieldSize="small"
            label={
              <Label labelFor="field-input-courseName">
                {stateTrainingFieldLabels.courseName}
              </Label>
            }
            onChange={field.onChange}
            errorMessage={errors.courseName?.message}
            fieldStatus={
              errors.courseName ? FieldStatus.ERROR : FieldStatus.DEFAULT
            }
          />
        )}
      />
    ),
    state: (
      <Controller
        name="state"
        control={control}
        rules={{ required: 'State is missing.' }}
        render={({ field }) => (
          <div style={{ maxWidth: '100px', minWidth: '70px' }}>
            <Select
              id="field-select-state"
              fieldSize="small"
              label={
                <Label labelFor="field-select-state">
                  {stateTrainingFieldLabels.state}
                </Label>
              }
              value={field.value}
              onValueChange={field.onChange}
              errorMessage={errors.state?.message}
              fieldStatus={
                errors.state ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              options={[
                {
                  textValue: 'CA',
                  value: 'CA',
                },
                {
                  textValue: 'AL',
                  value: 'AL',
                },
              ]}
            />
          </div>
        )}
      />
    ),
    hours: (
      <Controller
        name="hours"
        control={control}
        rules={{ required: 'Hours is missing.' }}
        render={({ field }) => (
          <FieldDataActive
            style={{ width: '100px' }}
            id="field-input-hours"
            fieldSize="small"
            label={
              <Label labelFor="field-input-hours">
                {stateTrainingFieldLabels.hours}
              </Label>
            }
            onChange={field.onChange}
            errorMessage={errors.hours?.message}
            fieldStatus={errors.hours ? FieldStatus.ERROR : FieldStatus.DEFAULT}
          />
        )}
      />
    ),
    completionDate: (
      <Controller
        control={control}
        name="completionDate"
        rules={{
          required: 'Completion date is missing.',
        }}
        render={({ field }) => (
          <div style={{ width: '150px' }}>
            <FieldDate
              label={
                <Label labelFor="one-time-premium-payment-date">
                  {stateTrainingFieldLabels.completionDate}
                </Label>
              }
              name="completionDate"
              onDateSelect={(date) =>
                field.onChange(standardDateMonthDayYear(date))
              }
              fieldStatus={
                errors.completionDate ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              errorMessage={errors.completionDate?.message}
              isInSidesheet={true}
            />
          </div>
        )}
      />
    ),
    expirationDate: (
      <Controller
        control={control}
        name="expirationDate"
        rules={{
          required: 'Expiration date is missing.',
        }}
        render={({ field }) => (
          <div style={{ width: '150px' }}>
            <FieldDate
              label={
                <Label labelFor="one-time-premium-payment-date">
                  {stateTrainingFieldLabels.expirationDate}
                </Label>
              }
              name="expirationDate"
              onDateSelect={(date) =>
                field.onChange(standardDateMonthDayYear(date))
              }
              fieldStatus={
                errors.expirationDate ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              errorMessage={errors.expirationDate?.message}
              isInSidesheet={true}
            />
          </div>
        )}
      />
    ),
  });

  // dictionary to preview each form field
  const previewFields = Object.fromEntries(
    Object.entries(stateTrainingFieldLabels).map(([fieldKey, fieldLabel]) => [
      fieldKey,
      {
        label: fieldLabel,
        value: formValues?.[fieldKey as keyof AddStateTrainingFormValues],
      },
    ])
  );

  // resets form and closes sidesheet
  const handleClose = () => {
    setStep(FormSteps.FORM);
    onSideSheetClose?.();
  };

  // called when the user confirms the previewed changes
  const handleConfirm = () => {
    setStep(FormSteps.CONFIRM);
  };

  // passes entered form data to the preview step
  const handleContinue = (data: AddStateTrainingFormValues) => {
    setFormValues(data);
    setStep(FormSteps.PREVIEW);
  };

  const handleBack = () => {
    setStep(FormSteps.FORM);
  };

  return (
    <>
      {step === FormSteps.FORM && (
        <AddForm<AddStateTrainingFormValues>
          onSubmit={handleContinue}
          onCancel={handleClose}
          controllers={formFields}
        />
      )}
      {step === FormSteps.PREVIEW && formValues && (
        <PreviewStep
          formValues={previewFields}
          onBack={handleBack}
          onConfirm={handleConfirm}
        />
      )}
      {step === FormSteps.CONFIRM && (
        <ConfirmStep
          closeCallback={handleClose}
          title="Got it!"
          message="Request to add the state training was received. It should complete shortly unless there's an issue."
        />
      )}
    </>
  );
};

export const AddStateTrainingSidesheet: FC = () => {
  return (
    <PomSideSheet
      header="Add State Training"
      trigger={
        <Button mode="link" size="small">
          <Icon type={IconType.ADD} small />
          Add
        </Button>
      }
    >
      <SideSheetContent />
    </PomSideSheet>
  );
};
