'use client';
import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { RouteKey, getPageTitle, routeMap } from '@/route-map';

import styles from './HeaderBreadcrumb.module.css';

interface PopoverInfo {
  content: ReactNode;
  title: string;
}

export interface HeaderBreadcrumbProps {
  title?: string;
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
  const [formatTitle, setFormatTitle] = useState(toTitleCase(title));
  const pathname = usePathname();
  const paths = (usePathname() || '').split('/');
  const params = useParams<{
    planCode: string;
    policyNumber: string;
    beneficiary: string;
  }>();

  useEffect(() => {
    // There are instances where this component is used outside of a layout and explicitly sets the title
    // if a title is set we will use that. See my-account page
    if (title) {
      return;
    }
    const pathParts = pathname.split('/');
    const routeKey = pathParts[pathParts.length - 1] ?? '';
    let heading;
    // if the policy number is the route key it means we are on a Policy Detail page
    if (params.policyNumber === routeKey) {
      heading = 'Policy details';
      // if the beneficiary id is the route key it means we are on a Beneficiary Detail page
    } else if (params.beneficiary === routeKey) {
      heading = getPageTitle(RouteKey.BENEFICIARY);
    } else {
      heading = routeMap[`/${routeKey}`]?.title ?? 'Policy details';
    }
    setFormatTitle(toTitleCase(heading));
  }, [params.beneficiary, params.policyNumber, pathname, title]);

  const currentPath = paths[paths.length - 1];

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
          prefetch
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
