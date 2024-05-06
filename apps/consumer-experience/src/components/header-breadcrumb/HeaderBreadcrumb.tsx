'use client';
import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';
import { toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

import styles from './HeaderBreadcrumb.module.css';

interface PopoverInfo {
  content: ReactNode;
  title: string;
}

export interface HeaderBreadcrumbProps {
  title: string;
  popover?: PopoverInfo;
  className?: string;
  /**
   * if the page is isolated or header should not show back arrow, set to true
   */
  preventGoBack?: boolean;
}

export const HeaderBreadcrumb = ({
  title,
  popover,
  className,
  preventGoBack,
}: HeaderBreadcrumbProps) => {
  const paths = (usePathname() || '').split('/');
  const params = useParams<{ planCode: string; policyNumber: string }>();

  if (!title) {
    return null;
  }

  const currentPath = paths[paths.length - 1];
  const formatTitle = toTitleCase(title);

  // If there's no current path or the current path is 'policies', it means you're at a root url
  // since we always redirect / to /policies paths will always start with 2 items.
  // if we are on /policies it means we are essentially at the root.
  if (!currentPath || currentPath === 'policies') {
    return <h1 className="typography-desktop-headline-1d">{formatTitle}</h1>;
  }

  let previousPath: string;

  if (currentPath === params.policyNumber) {
    previousPath = 'policies';
  } else {
    // we need to remove the first item which is an empty string
    // we remove the last item because we want to go back up one level
    previousPath = paths.slice(1, -1).join('/');
  }
  const previousPathName = previousPath || 'policy overview';
  const previousPathRoute = previousPath ? `/${previousPath}` : '/';

  return (
    <div className={clsx(styles.headerBreadcrumbContainer, className)}>
      {!preventGoBack && (
        <Link
          href={previousPathRoute}
          aria-label={`go to ${previousPathName} page`}
          className={styles.headerBreadcrumbAction}
        >
          <Icon
            type={IconType.CHEVRON}
            className={styles.headerBreadcrumbChevron}
            color="var(--color-base-icon-icon-action, #1E359C)"
          />
        </Link>
      )}
      <h1 className="typography-desktop-headline-1d">{formatTitle}</h1>
      {popover && popover.title && popover.content && (
        <Popover
          title={popover.title}
          trigger={
            <Icon
              type={IconType.CIRCLE_INFO}
              color="var(--color-base-icon-icon-tooltip, #ff7500)"
            />
          }
          placement={PopoverPlacement.BottomRight}
        >
          {popover.content}
        </Popover>
      )}
    </div>
  );
};
