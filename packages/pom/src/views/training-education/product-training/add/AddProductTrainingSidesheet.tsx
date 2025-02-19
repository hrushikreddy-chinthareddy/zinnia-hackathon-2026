import { FC, useState } from 'react';
import {
  Button,
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
import { ProductTrainingItem } from '../../../../types/training-education.types';
import { FormSteps } from '../../../utils';

export type AddProductTrainingFormValues = Pick<
  ProductTrainingItem,
  'carrier' | 'product' | 'completionDate'
>;

export interface SideSheetContentProps {
  onSideSheetClose?: () => void;
}

const SideSheetContent: FC<SideSheetContentProps> = ({ onSideSheetClose }) => {
  const [step, setStep] = useState<FormSteps>(FormSteps.FORM);
  const [formValues, setFormValues] = useState<AddProductTrainingFormValues>();

  const appointmentFieldLabels: Record<
    keyof AddProductTrainingFormValues,
    string
  > = {
    carrier: 'Carrier',
    product: 'Product',
    completionDate: 'Completion date',
  };

  // Add form fields
  const formFields = ({
    control,
    errors,
  }: {
    control: Control<AddProductTrainingFormValues>;
    errors: FieldErrors<AddProductTrainingFormValues>;
  }) => ({
    carrier: (
      <Controller
        name="carrier"
        control={control}
        rules={{ required: 'Carrier is missing.' }}
        render={({ field }) => (
          <Select
            id="field-select-carrier"
            fieldSize="small"
            label={<Label labelFor="field-select-carrier">Carrier</Label>}
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
    product: (
      <Controller
        name="product"
        control={control}
        rules={{ required: 'Product is missing.' }}
        render={({ field }) => (
          console.log(field),
          (
            <div style={{ width: '30%' }}>
              <Select
                id="field-select-product"
                fieldSize="small"
                label={<Label labelFor="field-select-product">Product</Label>}
                value={field.value}
                onValueChange={field.onChange}
                errorMessage={errors.product?.message}
                fieldStatus={
                  errors.product ? FieldStatus.ERROR : FieldStatus.DEFAULT
                }
                options={[
                  {
                    textValue: 'Product1',
                    value: 'product1',
                  },
                  {
                    textValue: 'Product2',
                    value: 'product2',
                  },
                ]}
              />
            </div>
          )
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
                  {appointmentFieldLabels.completionDate}
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
  });

  // Dictionary to preview each form field
  const previewFields: Record<
    keyof AddProductTrainingFormValues,
    { label: string; value: React.ReactNode }
  > = {
    carrier: {
      label: 'Carrier',
      value: formValues?.carrier,
    },
    product: {
      label: 'Product',
      value: formValues?.product,
    },
    completionDate: {
      label: 'Completion date',
      value: formValues?.completionDate,
    },
  };

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
  const handleContinue = (data: AddProductTrainingFormValues) => {
    setFormValues(data);
    setStep(FormSteps.PREVIEW);
  };

  const handleBack = () => {
    setStep(FormSteps.FORM);
  };

  return (
    <>
      {step === FormSteps.FORM && (
        <AddForm<AddProductTrainingFormValues>
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

export const AddProductTrainingSidesheet: FC = () => {
  return (
    <PomSideSheet
      header="Add Product Training"
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
