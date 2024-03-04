import * as RadixToggle from '@radix-ui/react-toggle';
import { ToggleProps } from './utils';
import { v4 as uuidv4 } from 'uuid';

import styles from './toggle.module.css';
import clsx from 'clsx';

export const Toggle = ({text, isDisabled, onClick, pressed}: ToggleProps) => {
  const labelId = text ? uuidv4() : '';

  return (
    <div className={clsx(styles.top, {[styles.disabled as string]: isDisabled})}>
      <RadixToggle.Root 
        className={styles.container}
        aria-labelledby={labelId}
        aria-label={!text ? 'Toggle' : ''}
        disabled={isDisabled}
        pressed={pressed}
        onPressedChange={onClick}
      >
        <div className={styles.circle} />
      </RadixToggle.Root>
      {!!text && <span id={labelId} className={styles.label}>{text}</span>}
    </div>
  );
}