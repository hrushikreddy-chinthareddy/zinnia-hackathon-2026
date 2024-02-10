import Bloom from '@zinnia/bloom/components';
import clsx from 'clsx';
import {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  cloneElement,
} from 'react';

import { Icon, IconType } from '../icon/Icon';
import './fieldData.css';

export interface FieldDataProps extends PropsWithChildren {
  Label?: ReactElement<typeof Bloom.Label>;
  caption?: ReactNode;
  /**
   * Defaults to colorBaseTextTextSecondary
   */
  captionColor?: string;
  /**
   * Increases the spacing between each row of elements
   */
  large?: boolean;
  iconType?: IconType;
}

export const FieldData = ({
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
          className="typographyContentCaption field-data__caption"
          style={captionColor ? { color: captionColor } : undefined}
        >
          {caption}
        </span>
      )}
      {/* TODO: eventually assistive text component will be added here */}
    </div>
  );
};
