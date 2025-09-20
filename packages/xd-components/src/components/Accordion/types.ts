
export enum AccordionType {
  DEFAULT = 'default',
  NESTED = 'nested',
}
export interface AccordionProps {
  sectionLabel: string | JSX.Element;
  type?: AccordionType;
  tags?: string[];
}
