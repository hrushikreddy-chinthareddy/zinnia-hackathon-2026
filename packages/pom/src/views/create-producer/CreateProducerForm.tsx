import {
  Button,
  ButtonGroup,
  FieldStatus,
  Label,
  Link,
  Select,
} from '@zinnia/bloom/components';
import { Controller, useForm } from 'react-hook-form';
import { Carrier, ProducerType } from '../../types';
import PomStyles from '../../styles/pom.module.css';
import styles from './CreateProducerForm.module.css';
import { IndividualFormFields } from './IndividualFormFields';
import { CorporationFormFields } from './CorporationFormFields';
import { ProducerFormData } from './types';
import { createProducer } from '../../queries/producers';
import { useState } from 'react';
import { Success } from '../../components/success/Success';
interface createProducerResponse {
  success: boolean;
  caseId: string | null;
}

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
    },
  });

  const [response, setResponse] = useState<createProducerResponse | undefined>(
    undefined
  );

  const onSubmit = async (formData: ProducerFormData) => {
    try {
      const response = await createProducer(formData);

      if (response.statusCode === 202) {
        setResponse({ success: true, caseId: response.caseId });
      }
    } catch (e) {
      console.log('error', e);
      setResponse({ success: false, caseId: null });
    }
  };

  const handleClose = () => {
    reset();
    setResponse(undefined);
  };
  const recordType = watch('recordType');
  const firstName = watch('firstName');
  const lastName = watch('lastName');

  // @TODO: refactor this once we use tanstack query
  if (response)
    return (
      <div
        id={PomStyles['producer-onboarding-maintenance']}
        className="card-container"
      >
        {response.success ? (
          <Success
            message={`A new record for ${firstName} ${lastName} was submitted for processing.`}
            action={
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/cases/${response?.caseId}/progress`}
                variant="button"
                text="Go to case"
              />
            }
            onClose={handleClose}
          />
        ) : (
          <>
            <h1>Error creating a producer!</h1>
            <Button mode="link" onClick={handleClose}>
              Close
            </Button>
          </>
        )}
      </div>
    );

  return (
    <div
      id={PomStyles['producer-onboarding-maintenance']}
      className="card-container"
    >
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
                fieldSize="small"
                label={<Label labelFor="field-select-carrier">Carrier</Label>}
                placeholder="-- Select carrier --"
                value={field.value}
                onValueChange={field.onChange}
                errorMessage={errors.carrier?.message}
                fieldStatus={
                  errors.carrier ? FieldStatus.ERROR : FieldStatus.DEFAULT
                }
                options={Object.values(Carrier).map(carrier => ({
                  textValue: carrier,
                  value: carrier,
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

        <div className={styles.submitButtons}>
          <Button type="submit" size="small">
            Create Record
          </Button>
          <Button mode="link" size="small" disabled>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
