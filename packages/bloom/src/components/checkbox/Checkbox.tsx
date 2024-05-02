'use client';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { v4 as uuidv4 } from 'uuid';
import styles from './checkbox.module.css';

import { CheckboxProps } from './utils';
import { Label } from '..';
import clsx from 'clsx';
import { useState } from 'react';

export const Checkbox = ({
  children,
  isCheckedByDefault,
  isDisabled,
  label,
  name,
  onClick,
  showError,
  value,
  id,
}: CheckboxProps) => {
  const checkboxId = id ?? uuidv4();
  const additionalLabelId = `${checkboxId}-label`;
  const [checked, setChecked] = useState(false);

  const updateChecked = () => {
    if (onClick) {
      onClick();
    }
    setChecked(!checked);
  };

  return (
    <div
      className={clsx(styles.container, {
        [styles.disabled as string]: isDisabled,
      })}
    >
      {!!label && (
        <div className={styles.label} id={additionalLabelId}>
          <Label>{label}</Label>{' '}
        </div>
      )}
      <RadixCheckbox.Root
        aria-describedby={label ? additionalLabelId : ''}
        className={clsx(styles.checkbox, {
          [styles.error as string]: showError,
        })}
        checked={checked}
        defaultChecked={isCheckedByDefault}
        disabled={isDisabled}
        id={checkboxId}
        name={name}
        onCheckedChange={updateChecked}
        value={value}
      >
        <RadixCheckbox.Indicator className={styles.indicator} />
      </RadixCheckbox.Root>
      {!!children && <label htmlFor={checkboxId}>{children}</label>}
    </div>
  );
};
