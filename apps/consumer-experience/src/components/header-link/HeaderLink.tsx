import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

import { toTitleCase } from '@/utils/strings';

import styles from './HeaderLink.module.css';

export interface HeaderLinkProps extends PropsWithChildren {
  title?: string;
  className?: string;
  link?: {
    url: string;
    label?: string;
  };
}
export const HeaderLink = ({
  children,
  className,
  link,
  title,
}: HeaderLinkProps) => {
  const formatTitle = toTitleCase(title);

  return (
    <div className={clsx(styles.headerLinkContainer, className)}>
      {link && (
        <Link
          href={link?.url}
          aria-label={link?.label}
          className={styles.headerLinkAction}
          prefetch
        >
          <Icon
            type={IconType.CHEVRON}
            className={styles.headerLinkChevron}
            color="var(--color-base-icon-icon-action)"
          />
        </Link>
      )}
      <h1 className="typography-desktop-headline-1d">{formatTitle}</h1>
      {children}
    </div>
  );
};
