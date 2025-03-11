import { Button, ButtonGroup } from '@zinnia/bloom/components';
import { useForm } from 'react-hook-form';
import { ProducerType } from '../../types';
import PomStyles from '../../styles/pom.module.css';
import styles from './CreateProducerForm.module.css';
import { IndividualFormFields } from './IndividualFormFields';
import { CorporationFormFields } from './CorporationFormFields';
import { ProducerFormData } from './types';

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
    },
  });

  const onSubmit = (_: ProducerFormData) => {
    // @TODO: integrate with API here
  };

  const recordType = watch('recordType');

  return (
    <div
      id={PomStyles['producer-onboarding-maintenance']}
      className={styles.container}
    >
      <h1 className={styles.title}>Add a Sales Entity</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="pom_flex-column gap-xl"
      >
        <div className={styles.formField}>
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
        </div>

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
