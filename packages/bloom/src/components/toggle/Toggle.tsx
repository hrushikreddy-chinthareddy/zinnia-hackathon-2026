import * as RadixToggle from '@radix-ui/react-toggle';
import { ToggleProps } from './utils';
import { v4 as uuidv4 } from 'uuid';

import styles from './toggle.module.css';
import clsx from 'clsx';

export const Toggle = ({ text, isDisabled, onClick, pressed, labelId }: ToggleProps) => {
  if(text?.length && !labelId) {
    labelId = uuidv4()
  }
  return (
    <div className={clsx(styles.top, isDisabled && styles.disabled)}>
      <RadixToggle.Root
        className={styles.container}
        aria-labelledby={text?.length ? labelId : undefined}
        aria-label={text?.length ? undefined : 'Toggle'}
        disabled={isDisabled}
        pressed={pressed}
        onPressedChange={onClick}
      >
        <div className={styles.indicator} />
      </RadixToggle.Root>
      {!!text && <span id={labelId} className={styles.label}>{text}</span>}
    </div>
  )
}