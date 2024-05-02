export interface CheckboxProps extends React.HTMLAttributes<HTMLInputElement> {
  isCheckedByDefault?: boolean;
  isDisabled?: boolean;
  label?: string;
  name?: string;
  onClick?: () => void;
  showError?: boolean;
  value?: string;
}
