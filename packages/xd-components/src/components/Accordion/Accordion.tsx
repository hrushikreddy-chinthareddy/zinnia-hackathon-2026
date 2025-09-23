import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@radix-ui/react-accordion';
import { Icon, IconType, Tag } from '@zinnia/bloom/components';
import { FC, PropsWithChildren, useEffect, useState } from 'react';

import styles from './Accordion.module.css';
import { AccordionProps, AccordionType } from './types';

export const Accordion: FC<PropsWithChildren<AccordionProps>> = ({
  children,
  sectionLabel,
  type = AccordionType.DEFAULT,
  tags,
  treeState,
}) => {
  const expandedValue = 'item-1';
  const [value, setValue] = useState(
    type === AccordionType.NESTED ? '' : expandedValue
  );

  // Side effect here is the easiest way to trigger a state change
  // *only* when the treeState prop changes
  useEffect(() => {
    if (treeState == null) return;
    setValue(treeState ? expandedValue : '');
  }, [treeState]);

  return (
    <AccordionRoot
      type="single"
      collapsible={true}
      value={value}
      onValueChange={setValue}
    >
      <AccordionItem value={expandedValue} className={styles.item}>
        <AccordionHeader>
          <AccordionTrigger
            className={`${styles.trigger} ${type === AccordionType.NESTED ? styles.nested : ''}`}
          >
            <Icon
              type={
                type === AccordionType.NESTED
                  ? IconType.CHEVRON_RIGHT
                  : IconType.CHEVRON
              }
              className={styles.chevron}
            />
            <h3 className="typography-labels-label-lg">{sectionLabel}</h3>
          </AccordionTrigger>
          <div className={styles.tags}>
            {tags?.map((tag, i) => (
              <Tag key={`tag_${i}`} text={tag}>
                {tag}
              </Tag>
            ))}
          </div>
        </AccordionHeader>
        <AccordionContent className={styles.content}>
          {children}
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  );
};
