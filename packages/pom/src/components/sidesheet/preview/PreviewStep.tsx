import { Button, Label } from '@zinnia/bloom/components';

interface PreviewStepProps<T> {
  formValues: Record<keyof T, { label: string; value: React.ReactNode }>;
  onBack: () => void;
  onConfirm: () => void;
}

export function PreviewStep<T>({
  formValues,
  onBack,
  onConfirm,
}: PreviewStepProps<T>) {
  return (
    <div className="pom_content-wrapper">
      <h3>Review the edits</h3>
      {Object.keys(formValues).map((key) => (
        <div key={key}>
          <Label>{formValues[key as keyof T].label}</Label>
          {formValues[key as keyof T].value}
        </div>
      ))}
      <div style={{ display: 'flex', gap: '32px' }}>
        <Button size="small" mode="primary" onClick={onConfirm}>
          Save
        </Button>
        <Button size="small" onClick={onBack} mode="link">
          Back
        </Button>
      </div>
    </div>
  );
}
