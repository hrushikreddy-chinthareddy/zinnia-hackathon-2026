import { useForm, SubmitHandler, Control, FieldErrors } from 'react-hook-form';
import { Button } from '@zinnia/bloom/components';
export interface AddFormProps<TFormValues extends Record<string, unknown>> {
  onSubmit: (data: TFormValues) => void;
  onCancel: () => void;
  // form controllers
  controllers: (deps: {
    control: Control<TFormValues>;
    errors: FieldErrors<TFormValues>;
  }) => Record<keyof TFormValues, JSX.Element>;
}

// Generic from
export function AddForm<TFormValues extends Record<string, unknown>>({
  onSubmit,
  onCancel,
  controllers,
}: AddFormProps<TFormValues>) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TFormValues>();

  const onFormSubmit: SubmitHandler<TFormValues> = (data) => onSubmit(data);

  const handleCancel = () => {
    reset();
    onCancel();
  };

  // Build the dictionary of controllers with the current control & errors
  const mappedControllers = controllers({ control, errors });

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="pom_flex-column gap-xl"
    >
      {Object.keys(mappedControllers).map((key) => (
        <div key={key}>{mappedControllers[key as keyof TFormValues]}</div>
      ))}

      <div style={{ display: 'flex', gap: '32px' }}>
        <Button type="submit" size="small">
          Continue
        </Button>
        <Button mode="link" onClick={handleCancel} size="small">
          Cancel
        </Button>
      </div>
    </form>
  );
}
