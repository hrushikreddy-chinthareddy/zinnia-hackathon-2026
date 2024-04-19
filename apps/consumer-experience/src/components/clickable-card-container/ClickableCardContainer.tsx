import { Icon, IconType } from '@zinnia/bloom/internal/components';
import { clsx } from 'clsx';
import { NextComponentType } from 'next';
import Link, { LinkProps } from 'next/link';
import { FC, PropsWithChildren, ReactNode } from 'react';

import styles from './clickableCardContainer.module.css';

interface LinkItem {
  /**
   * Defaults to true
   */
  isInternal?: boolean;
  url: string;
  label: string;
  disabled?: boolean;
  iconType?: IconType;
}

export interface ChildCard {
  content: ReactNode;
  linkTo?: LinkItem;
}

export interface Props extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  linkTo?: LinkItem;
  listItems?: ChildCard[];
}

const LinkArrow = ({
  url,
  label,
  isInternal = true,
  iconType = IconType.CHEVRON_RIGHT,
}: LinkItem) => {
  // TODO: add additional handling for 'open in new window or tab
  if (!url) {
    return null;
  }

  const Tag = isInternal
    ? (Link as unknown as NextComponentType<LinkProps>)
    : ('a' as keyof JSX.IntrinsicElements);

  return (
    <Tag href={url} aria-label={label} className={styles.primaryAction}>
      <Icon type={iconType} width={20} height={20} />
    </Tag>
  );
};

export const ClickableCardContainer: FC<Props> = ({
  children,
  className,
  linkTo,
  disabled,
  listItems,
}: Props) => {
  return (
    <div
      className={clsx(styles.clickableCardContainer, className, {
        [styles.disabled as string]: disabled,
      })}
    >
      <div className={styles.content}>
        {children}
        {linkTo && !disabled && <LinkArrow {...linkTo} />}
      </div>
      {listItems && listItems.length > 0 && (
        <ul>
          {listItems.map((item, index) => {
            if (!item) {
              return null;
            }
            return (
              <li
                className={`${styles.content} ${styles.listItem}`}
                key={`item-${index}`}
              >
                {item.content}
                {item.linkTo && !disabled && <LinkArrow {...item.linkTo} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
