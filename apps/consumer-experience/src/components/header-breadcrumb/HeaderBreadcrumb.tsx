'use client';
import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zdx/bloom/components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

import styles from './HeaderBreadcrumb.module.css';

interface PopoverInfo {
  content: ReactNode;
  title: string;
}

export interface HeaderBreadcrumbProps {
  title: string;
  popover?: PopoverInfo;
}

export const HeaderBreadcrumb = ({ title, popover }: HeaderBreadcrumbProps) => {
  if (!title) {
    return null;
  }

  const paths = usePathname().split('/');
  const currentPath = paths[paths.length - 1];

  // If there's no current path, it means you're at a root url
  if (!currentPath) {
    return <h1 className="typography-desktop-headline-1d">{title}</h1>;
  }
  // Get the segment before the current path segment, if the path before is the root,
  // paths.length - 2 will be an empty string
  const previousPath = paths[paths.length - 2];
  const previousPathRoute = previousPath ? `/${previousPath}` : '/';
  const previousPathName = previousPath || 'policy overview';

  return (
    <div className={styles.headerBreadcrumbContainer}>
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
      <h1 className="typography-desktop-headline-1d">{title}</h1>
      {popover && popover.title && popover.content && (
        <Popover
          title={popover.title}
          trigger={
            <Icon
              type={IconType.CIRCLE_INFO}
              color="var(--color-primary-color-primary, #ff7500)"
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
