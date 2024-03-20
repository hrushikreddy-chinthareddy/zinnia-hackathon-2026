import { ReactElement } from 'react';

export interface ButtonGroupItem {
  /**
   * Include this if button will only display an icon
   */
  ariaLabel?: string;
  // This doesn't actually work as long as 
  // [this issue](https://github.com/microsoft/TypeScript/issues/21699)
  // remains unsolved
  children: ReactElement<HTMLSpanElement> | ReactElement<SVGElement>;
  value: string;
  id?: string
}

export interface CommonProps {
  items: ButtonGroupItem[];
  /**
   * Indicates initial selected item, should match value from ButtonGroupItem
   * defaults to first item in array
   */
  defaultValue?: string;
  inactive?: boolean;
  onClick: () => void;
}

export type ConditionalProps =
  {
      /**
       * This should use the Label component
       */
      label?: ReactElement;
      ariaLabel?: never;
      id?: string;
    }
  | {
      label?: never;
      ariaLabel?: string;
      id?: never;
    };

export type ButtonGroupProps = CommonProps & ConditionalProps;
