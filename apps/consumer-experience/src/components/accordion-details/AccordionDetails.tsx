import * as Accordion from '@radix-ui/react-accordion';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { default as styles } from './AccordionDetails.module.css';
import {
  AccordionTriggerProps,
  AccordionContentProps,
  AccordionDetailsProps,
  AccordionType,
} from './utils';

export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Header className={styles.header}>
    <Accordion.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
      ref={forwardedRef}
    >
      <div>
        <Icon className={styles.chevron} type={IconType.CHEVRON} small />
      </div>
      {children}
    </Accordion.Trigger>
  </Accordion.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Content
    className={clsx(styles.content, className)}
    {...props}
    ref={forwardedRef}
  >
    <div>{children}</div>
  </Accordion.Content>
));
AccordionContent.displayName = 'AccordionContent';

export const AccordionItem = forwardRef<
  HTMLDivElement,
  Accordion.AccordionItemProps
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Item
    className={clsx(styles.content, className)}
    {...props}
    ref={forwardedRef}
  >
    <div>{children}</div>
  </Accordion.Item>
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionDetails = ({
  children,
  items,
  defaultValue,
  className,
  type = AccordionType.Single,
  collapsible = true,
}: AccordionDetailsProps) => {
  const accordionItems = () =>
    items
      ? items.map(item => (
          <Accordion.Item
            key={item.value}
            value={item.value}
            className={styles.item}
          >
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </Accordion.Item>
        ))
      : [];

  if (type === AccordionType.Multiple) {
    return (
      <Accordion.Root
        className={clsx(styles.container, className)}
        type="multiple"
        defaultValue={
          defaultValue
            ? Array.isArray(defaultValue)
              ? defaultValue
              : [defaultValue]
            : []
        }
      >
        {children || accordionItems()}
      </Accordion.Root>
    );
  }

  return (
    <Accordion.Root
      className={clsx(styles.container, className)}
      type="single"
      defaultValue={defaultValue as string}
      collapsible={collapsible}
    >
      {children || accordionItems()}
    </Accordion.Root>
  );
};

AccordionDetails.displayName = 'AccordionDetails';

export default AccordionDetails;
