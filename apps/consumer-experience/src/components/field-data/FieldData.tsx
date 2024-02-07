import Bloom from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ReactElement, ReactNode, cloneElement } from 'react';

import { Icon, IconType } from '../icon/Icon';
import './fieldData.css';

export interface FieldDataProps {
  // TODO: how to ensure uniqueness?
  fieldData: ReactNode;
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
  fieldData,
  Label,
  large,
  iconType,
}: FieldDataProps) => {
  if (!fieldData) {
    return null;
  }

  return (
    <div className={`${clsx(large && 'field-data__container--large')}`}>
      {/* TODO: should i add uuid to this to ensure uniqueness? */}
      {Label && cloneElement(Label)}
      <div className="field-data__value">
        {fieldData}
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
