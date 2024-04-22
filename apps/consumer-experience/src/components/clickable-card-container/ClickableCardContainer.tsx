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
  newTab?: boolean;
  url: string;
  label: string;
  disabled?: boolean;
  ctaText?: string;
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
  ctaText,
  iconType,
  isInternal = true,
  label,
  newTab = false,
  url,
}: LinkItem) => {
  // TODO: add additional handling for 'open in new window or tab
  if (!url) {
    return null;
  }

  let iconToRender = iconType;

  const Tag = isInternal
    ? (Link as unknown as NextComponentType<LinkProps>)
    : ('a' as keyof JSX.IntrinsicElements);

  if (!iconType && !ctaText) {
    iconToRender = IconType.CHEVRON_RIGHT;
  }

  return (
    <Tag
      href={url}
      aria-label={label}
      className={`${styles.primaryAction}`}
      target={newTab ? '_blank' : '_self'}
    >
      {ctaText && <div className="typography-nav-links-sm">{ctaText}</div>}
      {iconToRender && <Icon type={iconToRender} width={20} height={20} />}
    </Tag>
  );
};

export const ClickableList: FC<{
  disabled?: boolean;
  listItems: ChildCard[];
}> = ({ disabled, listItems }) => {
  return (
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
            {item.linkTo && !disabled && !item.linkTo.disabled && (
              <LinkArrow {...item.linkTo} />
            )}
          </li>
        );
      })}
    </ul>
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
        <ClickableList disabled={disabled} listItems={listItems} />
      )}
    </div>
  );
};

export const ClickableListContainer: FC<{
  className?: string;
  disabled?: boolean;
  listItems: ChildCard[];
}> = ({ className = '', disabled, listItems }) => {
  if (!listItems?.length) return null;
  return (
    <div
      className={clsx(styles.clickableCardContainer, className, {
        [styles.disabled as string]: disabled,
      })}
    >
      <ClickableList disabled={disabled} listItems={listItems} />
    </div>
  );
};
