import { FC, useState } from 'react';
import {
  Button,
  FieldData,
  FieldSize,
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
import { AmlTrainingItem } from '../../../../types/training-education.types';
import { FormSteps } from '../../../utils';

export type AddAmlTrainingFormValues = Pick<
  AmlTrainingItem,
  | 'carrier'
  | 'vendor'
  | 'courseNumber'
  | 'courseName'
  | 'completionDate'
  | 'expirationDate'
>;

export interface SideSheetContentProps {
  onSideSheetClose?: () => void;
}

const SideSheetContent: FC<SideSheetContentProps> = ({ onSideSheetClose }) => {
  const [step, setStep] = useState<FormSteps>(FormSteps.FORM);
  const [formValues, setFormValues] = useState<AddAmlTrainingFormValues>();

  const amlTrainingFieldLabels: Record<keyof AddAmlTrainingFormValues, string> =
    {
      carrier: 'Carrier',
      vendor: 'Vendor',
      courseNumber: 'Course number',
      courseName: 'Course name',
      completionDate: 'Completion date',
      expirationDate: 'Expiration date',
    };

  // Add form fields
  const formFields = ({
    control,
    errors,
  }: {
    control: Control<AddAmlTrainingFormValues>;
    errors: FieldErrors<AddAmlTrainingFormValues>;
  }) => ({
    carrier: (
      <Controller
        name="carrier"
        control={control}
        rules={{ required: 'Carrier is missing.' }}
        render={({ field }) => (
          <Select
            id="field-select-carrier"
            fieldSize={FieldSize.Small}
            label={
              <Label labelFor="field-select-carrier">
                {amlTrainingFieldLabels.carrier}
              </Label>
            }
            value={field.value}
            onValueChange={field.onChange}
            errorMessage={errors.carrier?.message}
            fieldStatus={
              errors.carrier ? FieldStatus.ERROR : FieldStatus.DEFAULT
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
    vendor: (
      <Controller
        name="vendor"
        control={control}
        rules={{ required: 'Vendor is missing.' }}
        render={({ field }) => (
          <div style={{ width: '30%' }}>
            <Select
              id="field-select-vendor"
              fieldSize={FieldSize.Small}
              label={<Label labelFor="field-select-vendor">Vendor</Label>}
              value={field.value}
              onValueChange={field.onChange}
              errorMessage={errors.vendor?.message}
              fieldStatus={
                errors.vendor ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              options={[
                {
                  textValue: 'Vendor1',
                  value: 'vendor1',
                },
                {
                  textValue: 'Vendor2',
                  value: 'vendor2',
                },
              ]}
            />
          </div>
        )}
      />
    ),
    courseNumber: (
      <Controller
        name="courseNumber"
        control={control}
        rules={{ required: 'Course number is missing.' }}
        render={({ field }) => (
          <FieldData
            style={{ width: '25%' }}
            id="field-input-course-number"
            fieldSize={FieldSize.Small}
            label={
              <Label labelFor="field-input-course-number">Course number</Label>
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
          <FieldData
            style={{ width: '30%' }}
            id="field-input-course-name"
            fieldSize={FieldSize.Small}
            label={
              <Label labelFor="field-input-course-name">Course name</Label>
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
                  {amlTrainingFieldLabels.completionDate}
                </Label>
              }
              name="completionDate"
              onDateSelect={date =>
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
                  {amlTrainingFieldLabels.expirationDate}
                </Label>
              }
              name="expirationDate"
              onDateSelect={date =>
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
    Object.entries(amlTrainingFieldLabels).map(([fieldKey, fieldLabel]) => [
      fieldKey,
      {
        label: fieldLabel,
        value: formValues?.[fieldKey as keyof AddAmlTrainingFormValues],
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
  const handleContinue = (data: AddAmlTrainingFormValues) => {
    setFormValues(data);
    setStep(FormSteps.PREVIEW);
  };

  const handleBack = () => {
    setStep(FormSteps.FORM);
  };

  return (
    <>
      {step === FormSteps.FORM && (
        <AddForm<AddAmlTrainingFormValues>
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
          message="Request to add the appointment was received. It should complete shortly unless there's an issue."
        />
      )}
    </>
  );
};

export const AddAmlTrainingSidesheet: FC = () => {
  return (
    <PomSideSheet
      header="Add AML training"
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
