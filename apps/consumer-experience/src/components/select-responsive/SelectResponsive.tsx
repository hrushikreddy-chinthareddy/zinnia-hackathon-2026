import {
  AssistiveText,
  AssistiveTextVariant,
  FieldStatus,
  Icon,
  IconType,
  Select,
  type SelectProps,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useState } from 'react';

import { default as styles } from './SelectResponsive.module.css';

export type SelectResponsiveProps = {
  id?: string;
  defaultValue?: string;
  errorMessage?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (...value: any[]) => void;
  options: SelectProps['options'];
  fieldSize?: 'small';
};

export const SelectResponsive = ({
  id = '',
  defaultValue,
  errorMessage,
  onChange,
  options,
  fieldSize = 'small',
}: SelectResponsiveProps) => {
  const [isMobileDevice, setIsMobileDevice] = useState<undefined | boolean>(
    undefined
  );

  if (typeof window !== 'undefined' && isMobileDevice === undefined) {
    setIsMobileDevice(window.navigator.maxTouchPoints > 0);
  }
  return (
    <div className={styles.wrapper}>
      {isMobileDevice ? (
        <>
          <select
            id={id}
            className={clsx(
              'typography-content-body-sm',
              styles.mobileSelect,
              !!errorMessage?.length && styles.error
            )}
            defaultValue={defaultValue}
            onChange={onChange}
          >
            {options.map(option => (
              <option key={option.value}>{option.textValue}</option>
            ))}
          </select>
          <Icon
            color="var(--color-base-icon-icon-action)"
            className={styles.chevron}
            type={IconType.CHEVRON}
          />
          {!!errorMessage?.length && (
            <AssistiveText
              className={styles.errorText}
              variant={AssistiveTextVariant.Error}
              text={errorMessage}
            />
          )}
        </>
      ) : (
        <Select
          id={id}
          onValueChange={onChange}
          options={options}
          defaultValue={defaultValue}
          errorMessage={errorMessage}
          contentClassName={styles.selectContent}
          fieldSize={fieldSize}
          fieldStatus={
            errorMessage?.length ? FieldStatus.ERROR : FieldStatus.DEFAULT
          }
        />
      )}
    </div>
  );
};
