import { Icon, IconType } from '@zdx/bloom/components';
import clsx from 'clsx';
import { PropsWithChildren, ReactNode, cloneElement } from 'react';

import './fieldData.css';

export interface FieldDataProps extends PropsWithChildren {
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
  Label,
  large,
  iconType,
}: FieldDataProps) => {
  if (!children) {
    return null;
  }

  return (
    <div className={`${clsx(large && 'field-data__container--large')}`}>
      {/* TODO: should i add uuid to this to ensure uniqueness? */}
      {Label && cloneElement(Label)}
      <div className="field-data__value">
        {children}
        {iconType && <Icon type={iconType} className="field-data__icon" />}
      </div>
      {caption && (
        <span
          className="typography-content-caption field-data__caption"
          style={captionColor ? { color: captionColor } : undefined}
        >
          {caption}
        </span>
      )}
      {AssistiveText && cloneElement(AssistiveText)}
    </div>
  );
};
