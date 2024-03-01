import * as RadixCheckbox from '@radix-ui/react-checkbox';
import styles from './checkbox.module.css';

import { CheckboxProps } from './utils';
import { Label } from '..';
import clsx from 'clsx';

export const Checkbox = ({ children, isChecked, isDisabled, label }: CheckboxProps) => (
    <div className={clsx(styles.container, { [styles.disabled as string]: isDisabled})}>
      {label && <div className={styles.label}><Label>{label}</Label> </div>}
      <RadixCheckbox.Root className={styles.checkbox} checked={isChecked} disabled={isDisabled} id="c1">
        <RadixCheckbox.Indicator className={styles.indicator} />
      </RadixCheckbox.Root>
      {children && <label htmlFor="c1">
        {children}
      </label>}
    </div>
);
