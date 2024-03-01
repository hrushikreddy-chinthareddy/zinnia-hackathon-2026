import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { v4 as uuidv4 } from 'uuid';
import styles from './checkbox.module.css';

import { CheckboxProps } from './utils';
import { Label } from '..';
import clsx from 'clsx';

export const Checkbox = ({ children, isChecked, isDisabled, label }: CheckboxProps) => {
  const checkboxId = uuidv4();
  const additionalLabelId = `${checkboxId}-label`
  return (
    <div className={clsx(styles.container, { [styles.disabled as string]: isDisabled})}>
      {!!label && <div className={styles.label} id={additionalLabelId}><Label>{label}</Label> </div>}
      <RadixCheckbox.Root aria-describedby={label ? additionalLabelId : ''} className={styles.checkbox} checked={isChecked} disabled={isDisabled} id={checkboxId}>
        <RadixCheckbox.Indicator className={styles.indicator} />
      </RadixCheckbox.Root>
      {!!children && <label htmlFor={checkboxId}>
        {children}
      </label>}
    </div>
)};
