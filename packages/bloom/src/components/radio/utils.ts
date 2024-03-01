export { Radio } from './radio';

export interface RadioProps
  extends React.HTMLAttributes<HTMLInputElement> {
  isDisabled?: boolean;
  label?: string;
  ariaLabel?: string;
}