import * as RadixCheckbox from '@radix-ui/react-checkbox';
import styles from './checkbox.module.css';

import { CheckboxProps } from './utils';

export const Checkbox = ({ children, isChecked, isDisabled }: CheckboxProps) => (
  <form className={styles.form}>
    <div className={styles.container}>
      <RadixCheckbox.Root className={styles.checkbox} checked={isChecked} disabled={isDisabled} id="c1">
        <RadixCheckbox.Indicator className={styles.indicator} />
      </RadixCheckbox.Root>
      {children && <label htmlFor="c1">
        {children}
      </label>}
    </div>
  </form>
);
