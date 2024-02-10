'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

import styles from './HeaderBreadcrumb.module.css';
import { Icon, IconType } from '../icon/Icon';
import { Popover } from '../popover/Popover';
import { PopoverPlacement } from '../popover/popover.helper';

interface PopoverInfo {
  content: ReactNode;
  title: string;
}

export interface HeaderBreadcrumbProps {
  title: string;
  popover?: PopoverInfo;
}

export const HeaderBreadcrumb = ({ title, popover }: HeaderBreadcrumbProps) => {
  const paths = usePathname().split('/');
  // Get the segment before the current path segment
  const previousPathIndex = paths.length - 2 || 0;
  const previousPath = `/${paths[previousPathIndex]}` || '/';
  const previousPathName = paths[previousPathIndex] || 'policy overview';

  if (!title) {
    return <h1 className="typography-desktop-headline-1d">{title}</h1>;
  }

  return (
    <div className={styles.headerBreadcrumbContainer}>
      <Link
        href={previousPath}
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
