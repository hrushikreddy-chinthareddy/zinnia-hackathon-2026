import * as Accordion from '@radix-ui/react-accordion';
import { ReactNode } from 'react';
export interface AccordionTriggerProps extends Accordion.AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}
export interface AccordionContentProps extends Accordion.AccordionContentProps {
  children: ReactNode;
  className?: string;
}
export interface AccordionItemData {
  value: string;
  trigger: ReactNode;
  content: ReactNode;
}

export enum AccordionType {
  Single = 'single',
  Multiple = 'multiple',
}

export interface AccordionDetailsBaseProps {
  defaultValue?: string | string[];
  className?: string;
  type?: AccordionType;
  collapsible?: boolean;
}
// if accordion items are passed, children prop should not be passed
export interface AccordionDetailsWithItemsProps
  extends AccordionDetailsBaseProps {
  items: AccordionItemData[];
  children?: never;
}

export interface AccordionDetailsWithChildrenProps
  extends AccordionDetailsBaseProps {
  children: ReactNode;
  items?: never;
}

export type AccordionDetailsProps =
  | AccordionDetailsWithChildrenProps
  | AccordionDetailsWithItemsProps;
