import { FC, useState } from 'react';
import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  FieldDataActive,
  FieldStatus,
  Icon,
  IconType,
  Label,
  Radio,
  Select,
} from '@zinnia/bloom/components';
import { PreviewStep } from '../../../../components/sidesheet/preview/PreviewStep';
import { ConfirmStep } from '../../../../components/sidesheet/confirm/ConfirmStep';
import { AddForm } from '../../../../components/sidesheet/add-form/AddForm';
import { PomSideSheet } from '../../../../components/pom-sidesheet/PomSidesheet';
import { FieldDate } from '../../../../components/date/FieldDate';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { standardDateMonthDayYear } from '@zinnia/utils';
import { Appointment, AppointmentStatus, YesNo } from '../../../../types';
import { FormSteps } from '../../../utils';

export type AddAppointmentFormValues = Pick<
  Appointment,
  | 'status'
  | 'carrier'
  | 'state'
  | 'resident'
  | 'licenseNumber'
  | 'company'
  | 'effectiveDate'
>;

export interface SideSheetContentProps {
  onSideSheetClose?: () => void;
}

const SideSheetContent: FC<SideSheetContentProps> = ({ onSideSheetClose }) => {
  const [step, setStep] = useState<FormSteps>(FormSteps.FORM);
  const [formValues, setFormValues] = useState<AddAppointmentFormValues>();

  const appointmentFieldLabels: Record<keyof AddAppointmentFormValues, string> =
    {
      status: 'Status',
      carrier: 'Carrier',
      state: 'State',
      resident: 'Resident',
      licenseNumber: 'License number',
      company: 'Company',
      effectiveDate: 'Effective date',
    };

  // Add form fields
  const formFields = ({
    control,
    errors,
  }: {
    control: Control<AddAppointmentFormValues>;
    errors: FieldErrors<AddAppointmentFormValues>;
  }) => ({
    status: (
      <Controller
        name="status"
        control={control}
        rules={{ required: 'Status is missing.' }}
        render={({ field }) => (
          <div className="pom_flex-column gap-lg">
            <Radio
              id="radio-appointment-status"
              groupLabel={appointmentFieldLabels.status}
              onValueChange={field.onChange}
              options={[
                {
                  ariaLabel: 'Just in time',
                  label: AppointmentStatus.JUST_IN_TIME,
                  value: AppointmentStatus.JUST_IN_TIME,
                },
                {
                  ariaLabel: 'Pending',
                  label: AppointmentStatus.PENDING,
                  value: AppointmentStatus.PENDING,
                },
                {
                  ariaLabel: 'Approved',
                  label: AppointmentStatus.APPROVED,
                  value: AppointmentStatus.APPROVED,
                },
              ]}
            />
            {errors.status && (
              <AssistiveText
                text={errors.status.message || 'Status is missing.'}
                variant={AssistiveTextVariant.Error}
              />
            )}
          </div>
        )}
      />
    ),
    carrier: (
      <Controller
        name="carrier"
        control={control}
        rules={{ required: 'Carrier is missing.' }}
        render={({ field }) => (
          <Select
            id="field-select-carrier"
            fieldSize="small"
            label={
              <Label labelFor="field-select-carrier">
                {appointmentFieldLabels.carrier}
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
                  {appointmentFieldLabels.state}
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
    resident: (
      <Controller
        name="resident"
        control={control}
        rules={{ required: 'Resident is missing.' }}
        render={({ field }) => (
          <div className="pom_flex-column gap-lg">
            <Radio
              id="radio-appointment-resident"
              groupLabel="Resident"
              onValueChange={field.onChange}
              options={Object.values(YesNo).map((yesNo) => ({
                ariaLabel: yesNo,
                label: yesNo,
                value: yesNo,
              }))}
            />
            {errors.resident && (
              <AssistiveText
                text={errors.resident.message || 'Resident is missing.'}
                variant={AssistiveTextVariant.Error}
              />
            )}
          </div>
        )}
      />
    ),
    licenseNumber: (
      <Controller
        name="licenseNumber"
        control={control}
        rules={{ required: 'License is missing.' }}
        render={({ field }) => (
          <FieldDataActive
            style={{ width: '100px' }}
            id="field-input-license"
            fieldSize="small"
            label={
              <Label labelFor="field-input-license">
                {appointmentFieldLabels.licenseNumber}
              </Label>
            }
            onChange={field.onChange}
            errorMessage={errors.licenseNumber?.message}
            fieldStatus={
              errors.licenseNumber ? FieldStatus.ERROR : FieldStatus.DEFAULT
            }
          />
        )}
      />
    ),
    company: (
      <Controller
        name="company"
        control={control}
        rules={{ required: 'Company is missing.' }}
        render={({ field }) => (
          <div style={{ maxWidth: '250px', minWidth: '150px' }}>
            <Select
              id="field-select-company"
              fieldSize="small"
              label={
                <Label labelFor="field-select-company">
                  {appointmentFieldLabels.company}
                </Label>
              }
              value={field.value}
              onValueChange={field.onChange}
              errorMessage={errors.company?.message}
              fieldStatus={
                errors.company ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              options={[
                {
                  textValue: 'Company A',
                  value: 'company-a',
                },
                {
                  textValue: 'Company B',
                  value: 'company-b',
                },
              ]}
            />
          </div>
        )}
      />
    ),
    effectiveDate: (
      <Controller
        control={control}
        name="effectiveDate"
        rules={{
          required: 'Effective date is missing.',
        }}
        render={({ field }) => (
          <div style={{ width: '150px' }}>
            <FieldDate
              label={
                <Label labelFor="one-time-premium-payment-date">
                  {appointmentFieldLabels.effectiveDate}
                </Label>
              }
              name="effectiveDate"
              onDateSelect={(date) =>
                field.onChange(standardDateMonthDayYear(date))
              }
              fieldStatus={
                errors.effectiveDate ? FieldStatus.ERROR : FieldStatus.DEFAULT
              }
              errorMessage={errors.effectiveDate?.message}
              isInSidesheet={true}
            />
          </div>
        )}
      />
    ),
  });

  // dictionary to preview each form field
  const previewFields = Object.fromEntries(
    Object.entries(appointmentFieldLabels).map(([fieldKey, fieldLabel]) => [
      fieldKey,
      {
        label: fieldLabel,
        value: formValues?.[fieldKey as keyof AddAppointmentFormValues],
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
  const handleContinue = (data: AddAppointmentFormValues) => {
    setFormValues(data);
    setStep(FormSteps.PREVIEW);
  };

  const handleBack = () => {
    setStep(FormSteps.FORM);
  };

  return (
    <>
      {step === FormSteps.FORM && (
        <AddForm<AddAppointmentFormValues>
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

export const AddAppointmentSidesheet: FC = () => {
  return (
    <PomSideSheet
      header="Add Appointment"
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
