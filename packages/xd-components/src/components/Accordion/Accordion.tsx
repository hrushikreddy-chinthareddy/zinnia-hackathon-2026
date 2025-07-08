import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@radix-ui/react-accordion';
import { Icon, IconType } from '@zinnia/bloom/components';
import { FC, PropsWithChildren } from 'react';

import styles from './Accordion.module.css';
import { AccordionProps } from './types';

export const Accordion: FC<PropsWithChildren<AccordionProps>> = ({
  children,
  sectionLabel,
}) => {
  return (
    <AccordionRoot type="single" collapsible={true} defaultValue="item-1">
      <AccordionItem value="item-1" className={styles.item}>
        <AccordionHeader>
          <AccordionTrigger className={styles.trigger}>
            <Icon type={IconType.CHEVRON} className={styles.chevron} />
            <h3 className="typography-labels-label-lg">{sectionLabel}</h3>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent className={styles.content}>
          {children}
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  );
};
