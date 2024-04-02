import { Icon, IconType } from '@zinnia/bloom/internal/components';
import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  isEligible: boolean;
  showIcon?: boolean;
}

export const StatusIconText = ({ isEligible, showIcon, className }: Props) => {
  const text = isEligible ? 'Eligible' : 'Ineligible';
  const iconType = isEligible ? IconType.CHECKMARK : IconType.BAN;
  const color = isEligible
    ? 'var(--color-status-text-status-success-text)'
    : 'var(--color-status-text-status-error-text)';
  const iconColor = isEligible
    ? 'var(--color-status-text-status-success-icon)'
    : 'var(--color-status-text-status-error-icon)';

  return (
    <span style={{ color }} className={className}>
      {showIcon && <Icon type={iconType} color={iconColor} />}
      {text}
    </span>
  );
};
