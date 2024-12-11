import { Label, Icon, IconType } from '@zinnia/bloom/components';
import { HTMLAttributes } from 'react';

import { FieldData } from '@/components/field-data/FieldData';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from '../policy-overview/PolicyOverview.module.css';

interface ValueWithPopoverProps extends HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  icon?: IconType;
  value?: number | null | string;
  popoverElement: JSX.Element;
  label: string;
  emphasizeValue?: boolean;
}

export const ValueWithPopover = async ({
  className,
  hideLabel,
  icon,
  value,
  popoverElement,
  label,
  emphasizeValue = false,
}: ValueWithPopoverProps) => {
  const renderValue = () => {
    if (isNullEmptyOrUndefined(value)) {
      return (
        <p className="typography-content-body-sm">
          {DEFAULT_UNAVAILABLE_STRING}
        </p>
      );
    }
    if (emphasizeValue) {
      return <p className="typography-content-value">{value}</p>;
    }
    return <p className="typography-content-body-sm">{value}</p>;
  };

  return (
    <div className={`${styles.rowWrapper} ${className}`}>
      <div className={styles.content}>
        {icon && <Icon type={icon} className={styles.icon} />}
        <FieldData
          {...(!hideLabel && {
            Label: (
              <Label interactiveElements={[popoverElement]}>{label}</Label>
            ),
          })}
        >
          {renderValue()}
        </FieldData>
      </div>
    </div>
  );
};
