import { Icon, IconType } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import {
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  cloneElement,
} from 'react';

import styles from './FieldData.module.css';
export interface FieldDataProps
  extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  /**
   * Assistive text component
   * typeof: "success" | "info" | "default" | "error"
   */
  AssistiveText?: JSX.Element;
  Label?: JSX.Element;
  caption?: ReactNode;
  /**
   * Defaults to color-base-text-text-secondary
   */
  captionColor?: string;
  /**
   * Increases the spacing between each row of elements
   */
  large?: boolean;
  iconType?: IconType;
}

export const FieldData = ({
  AssistiveText,
  caption,
  captionColor,
  children,
  className,
  Label,
  large,
  iconType,
}: FieldDataProps) => {
  if (!children) {
    return null;
  }

  return (
    <div className={clsx(styles.container, { [`${className}`]: className })}>
      {/* TODO: should i add uuid to this to ensure uniqueness? */}
      <div className={styles.label}>{Label && cloneElement(Label)}</div>
      <div className={clsx(styles.value, { [styles.large as string]: large })}>
        {children}
        {iconType && <Icon type={iconType} className={styles.icon} />}
      </div>
      {caption && (
        <span
          className={`${styles.caption} typography-content-caption`}
          style={captionColor ? { color: captionColor } : undefined}
        >
          {caption}
        </span>
      )}
      {AssistiveText && cloneElement(AssistiveText)}
    </div>
  );
};
