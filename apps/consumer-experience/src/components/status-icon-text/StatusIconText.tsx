import { Icon, IconType } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import { isNullEmptyOrUndefined } from '@/utils/data';

import styles from './StatusIconText.module.css';

interface Props extends HTMLAttributes<HTMLDivElement> {
  isEligible?: boolean;
  showIcon?: boolean;
}

export const StatusIconText = ({ isEligible, showIcon, className }: Props) => {
  if (isNullEmptyOrUndefined(isEligible)) {
    return null;
  }

  const text = isEligible ? 'Eligible' : 'Ineligible';
  const iconType = isEligible ? IconType.CHECKMARK : IconType.BAN;
  const color = isEligible
    ? 'var(--color-status-text-status-success-text)'
    : 'var(--color-status-text-status-error-text)';
  const iconColor = isEligible
    ? 'var(--color-status-icon-status-success-icon)'
    : 'var(--color-status-icon-status-error-icon)';

  return (
    <span
      style={{ color }}
      className={clsx(styles.statusIconText, { [`${className}`]: className })}
    >
      {showIcon && <Icon type={iconType} color={iconColor} />}
      {text}
    </span>
  );
};
