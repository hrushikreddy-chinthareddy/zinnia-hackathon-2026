export { Checkbox } from './Checkbox';

export interface CheckboxProps
  extends React.HTMLAttributes<HTMLInputElement> {
  onClick?: () => void;
  isChecked?: boolean;
  isDisabled?: boolean;
  label?: string;
}