'use client';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';
import { PropsWithChildren, useEffect } from 'react';

import { analytics } from '@/utils/segment';
import { toTitleCase } from '@/utils/strings';

import styles from './HeaderLink.module.css';

export interface HeaderLinkProps extends PropsWithChildren {
  title?: string;
  className?: string;
  link?: {
    url: string;
    label?: string;
  };
  /**
   * This is needed for analytics
   */
  // I don't love having to add this as a prop just for analytics, but trying to get it out of the pathname
  // felt even more brittle and there's no store so here we are.
  policyNumber?: string;
}
export const HeaderLink = ({
  children,
  className,
  link,
  title,
  policyNumber,
}: HeaderLinkProps) => {
  const formatTitle = toTitleCase(title);

  useEffect(() => {
    analytics.page(title, { policyId: policyNumber });
  }, [policyNumber, title]);

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
