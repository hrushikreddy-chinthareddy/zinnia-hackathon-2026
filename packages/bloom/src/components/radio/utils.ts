export { Radio } from './radio';

type RadioOption = {
  label: string;
  ariaLabel: string;
  value: string;
}

export interface RadioProps
  extends React.HTMLAttributes<HTMLInputElement> {
  isDisabled?: boolean;
  label?: string;
  groupLabel?: string;
  options: RadioOption[];
  defaultValue?: string;
}