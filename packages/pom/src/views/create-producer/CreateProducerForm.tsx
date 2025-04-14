import {
  Button,
  ButtonGroup,
  FieldSize,
  FieldStatus,
  Label,
  Link,
  Select,
} from '@zinnia/bloom/components';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { CarrierName, Carriers, ProducerType } from '../../types';
import PomStyles from '../../styles/pom.module.css';
import styles from './CreateProducerForm.module.css';
import { IndividualFormFields } from './IndividualFormFields';
import { CorporationFormFields } from './CorporationFormFields';
import { HierarchyFormFields } from './HierarchyFormFields';
import { ProducerFormData } from './types';
import { createProducer } from '../../queries/producers';
import {
  Success,
  Error,
} from '../../components/transaction-response-card/TransactionResponseCard';
import { useMutation } from '@tanstack/react-query';

export const CreateProducerForm = () => {
  const {
    handleSubmit,
    watch,
    reset,
    register,
    formState: { errors },
    control,
  } = useForm<ProducerFormData>({
    defaultValues: {
      recordType: ProducerType.INDIVIDUAL,
      dateOfBirth: '',
      carrier: Carriers[CarrierName.ZINNIA].shortName,
      hierarchy: {
        producerLookupId: '',
        level: '',
        effectiveDate: '',
        uplineProducersInformation: [
          {
            lookupId: '',
            level: '',
          },
        ],
      },
    },
  });

  const fieldArray = useFieldArray({
    control,
    name: 'hierarchy.uplineProducersInformation',
  });

  const mutation = useMutation({
    mutationFn: (formData: ProducerFormData) => createProducer(formData),
  });

  const onSubmit = async (formData: ProducerFormData) => {
    mutation.mutate(formData);
  };

  const handleClose = () => {
    reset();
    mutation.reset();
  };

  // Get the record type from the form fields
  const recordType = watch('recordType');

  // Get the producer name from the form fields
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const fullName = watch('fullName');

  // Construct the producer name from the form fields
  const producerName =
    recordType === ProducerType.INDIVIDUAL
      ? // only show the first and last name if both available
        firstName && lastName && `${firstName} ${lastName}`
      : fullName;

  return (
    <div id={PomStyles['producer-onboarding-maintenance']}>
      {mutation.isError && (
        <Error
          message={
            mutation.error?.message ||
            'An error occurred while creating the producer.'
          }
          onClose={() => {
            mutation.reset();
          }}
        />
      )}
      {mutation.isSuccess && mutation.data?.statusCode === 202 && (
        <Success
          message={`A new record for ${producerName} was submitted for processing.`}
          action={
            <Link
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/cases/${mutation.data.caseId}/progress`}
              variant="button"
              text="Go to case"
            />
          }
          onClose={handleClose}
        />
      )}
      {(mutation.isIdle || mutation.isPending) && (
        <div className="card-container">
          <h1 className={styles.title}>Add a Sales Entity</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="pom_flex-column gap-xl"
          >
            <div className={styles.formField}>
              <Controller
                name="recordType"
                control={control}
                rules={{ required: 'ProducerType is missing.' }}
                render={() => (
                  <ButtonGroup
                    items={[
                      {
                        children: <span>Individual</span>,
                        id: ProducerType.INDIVIDUAL,
                        value: ProducerType.INDIVIDUAL,
                      },
                      {
                        children: <span>Corporation</span>,
                        id: ProducerType.CORPORATION,
                        value: ProducerType.CORPORATION,
                      },
                    ]}
                    onClick={value => {
                      reset({
                        recordType: value as ProducerType,
                      });
                    }}
                  />
                )}
              />
            </div>
            <Controller
              name="carrier"
              control={control}
              rules={{ required: 'Carrier is missing.' }}
              render={({ field }) => (
                <div className={styles.formField}>
                  <Select
                    id="field-select-carrier"
                    fieldSize={FieldSize.Small}
                    label={
                      <Label labelFor="field-select-carrier">Carrier</Label>
                    }
                    placeholder="-- Select carrier --"
                    value={field.value}
                    onValueChange={field.onChange}
                    errorMessage={errors.carrier?.message}
                    fieldStatus={
                      errors.carrier ? FieldStatus.ERROR : FieldStatus.DEFAULT
                    }
                    options={Object.values(Carriers).map(carrier => ({
                      textValue: carrier.name,
                      value: carrier.shortName,
                    }))}
                  />
                </div>
              )}
            />
            {recordType === ProducerType.CORPORATION && (
              <CorporationFormFields
                register={register}
                errors={errors}
                control={control}
              />
            )}
            {recordType === ProducerType.INDIVIDUAL && (
              <IndividualFormFields
                register={register}
                errors={errors}
                control={control}
              />
            )}
            <h2>Hierarchies</h2>
            {!!producerName && <h3>{producerName}</h3>}
            <HierarchyFormFields
              register={register}
              errors={errors}
              control={control}
              watch={watch}
              fieldArray={fieldArray}
            />
            <div className={styles.submitButtons}>
              <Button type="submit" size="small" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create Record'}
              </Button>
              <Button mode="link" size="small" disabled>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
