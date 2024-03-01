import { ReactElement } from 'react';

export interface ButtonGroupItem {
  /**
   * Include this if button will only display an icon
   */
  ariaLabel?: string;
  // TODO: this doesn't actually type check correctly and throw error if someone puts in another type
  children: ReactElement<HTMLSpanElement> | ReactElement<SVGElement>;
  value: string;
}

export interface CommonProps {
  items: ButtonGroupItem[];
  /**
   * Indicates initial selected item, should match value from ButtonGroupItem
   * defaults to first item in array
   */
  defaultValue?: string;
  onClick: () => void;
}

type ConditionalProps =
  | {
      /**
       * This should use the Label component
       */
      label?: ReactElement;
      ariaLabel?: never;
      id: string;
    }
  | {
      label?: never;
      ariaLabel?: string;
      id: never;
    };

export type ButtonGroupProps = CommonProps & ConditionalProps;
