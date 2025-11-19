import { Icon, IconType } from '@zinnia/bloom/components';
import { clsx } from 'clsx';
import { NextComponentType } from 'next';
import { FC, PropsWithChildren, ReactNode } from 'react';

import { Link, Props as LinkProps } from '@/components/link/Link';

import styles from './ClickableCardContainer.module.css';

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
  /**
   * Only need to pass this if you want the arrow icon to show as well as cta text
   * if you do not pass in ctaText, the arrow will show by default
   */
  showArrow?: boolean;
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
  showArrow,
}: LinkItem) => {
  // TODO: add additional handling for 'open in new window or tab
  if (!url) {
    return null;
  }

  let iconToRender = iconType;

  const Tag = isInternal
    ? (Link as unknown as NextComponentType<LinkProps>)
    : ('a' as keyof JSX.IntrinsicElements);

  if ((!iconType && !ctaText) || showArrow) {
    iconToRender = IconType.CHEVRON_RIGHT;
  }

  return (
    <Tag
      href={url}
      aria-label={label}
      className={`${styles.primaryAction}`}
      target={newTab ? '_blank' : '_self'}
      // @ts-expect-error prop diff
      prefetch={isInternal ? true : undefined}
      isInternal={isInternal}
    >
      <div className="flex-center">
        {ctaText && (
          <div
            className={clsx('typography-nav-links-sm mr-sm', {
              'mr-sm': showArrow,
            })}
          >
            {ctaText}
          </div>
        )}
        {iconToRender && (
          <Icon
            type={iconToRender}
            width={20}
            height={20}
            color="var(--color-base-icon-icon-action)"
          />
        )}
      </div>
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

export const ClickableCardContainer = ({
  children,
  className,
  disabled,
  listItems,
}: Props) => {
  return (
    <div
      className={clsx(styles.clickableCardContainer, className, {
        [styles.disabled as string]: disabled,
      })}
    >
      <div className={styles.content}>{children}</div>
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

interface LinkContentProps extends PropsWithChildren {
  linkTo?: LinkItem;
  disabled?: boolean;
}

const LinkContent = ({ children, linkTo, disabled }: LinkContentProps) => {
  return (
    <div className={styles.linkContent}>
      {children}
      {linkTo && !disabled && <LinkArrow {...linkTo} />}
    </div>
  );
};

const AdditionalContent: FC<PropsWithChildren> = ({ children }) => (
  <div>{children}</div>
);

ClickableCardContainer.LinkContent = LinkContent;
ClickableCardContainer.AdditionalContent = AdditionalContent;
