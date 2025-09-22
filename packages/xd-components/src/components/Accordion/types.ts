
export enum AccordionType {
  DEFAULT = 'default',
  NESTED = 'nested',
}
export interface AccordionProps {
  sectionLabel: string;
  type?: AccordionType;
  tags?: string[];
}
