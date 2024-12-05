'use client';
import { toTitleCase } from '@zinnia/utils';
import { useParams, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { RouteKey, getPageTitle, routeMap } from '@/route-map';
import { LineOfBusinessPath } from '@/types';
import { analytics } from '@/utils/segment';

import { HeaderLink } from '../header-link/HeaderLink';

interface PopoverInfo {
  content: ReactNode;
  title: string;
}

export interface HeaderBreadcrumbProps {
  title?: string;
  popover?: PopoverInfo;
  className?: string;
  /**
   * this is used on all layout pages, but some pages should not default to return to
   * index like the all policies page, so we want to prevent returning to any page
   */
  preventReturnToPrevious?: boolean;
}

export const HeaderBreadcrumb = ({
  title,
  className,
  preventReturnToPrevious,
}: HeaderBreadcrumbProps) => {
  const [formatTitle, setFormatTitle] = useState(toTitleCase(title));
  const pathname = usePathname();
  const paths = (usePathname() || '').split('/');
  const defaultTitle =
    paths[2] === LineOfBusinessPath.ANNUITIES
      ? 'contract overview'
      : 'policy overview';
  const params = useParams<{
    planCode: string;
    policyNumber: string;
    beneficiary: string;
  }>();

  useEffect(() => {
    // There are instances where this component is used outside of a layout and explicitly sets the title
    // if a title is set we will use that.
    if (title) {
      return;
    }
    const pathParts = pathname.split('/');

    const routeKey = pathParts[pathParts.length - 1] ?? '';
    let heading;
    // if the policy number is the route key it means we are on a Policy Detail page
    if (params.policyNumber === routeKey) {
      heading = toTitleCase(defaultTitle);
      // if the beneficiary id is the route key it means we are on a Beneficiary Detail page
    } else if (params.beneficiary === routeKey) {
      heading = getPageTitle(RouteKey.BENEFICIARY);
    } else {
      heading = routeMap[`/${routeKey}`]?.title ?? toTitleCase(defaultTitle);
    }
    setFormatTitle(toTitleCase(heading));
    analytics.page(toTitleCase(heading), { policyId: params.policyNumber });
  }, [defaultTitle, params.beneficiary, params.policyNumber, pathname, title]);

  const currentPath = paths[paths.length - 1];

  let previousPath: string;

  if (currentPath === params.policyNumber) {
    previousPath = 'coverage';
  } else {
    // we need to remove the first item which is an empty string
    // we remove the last item because we want to go back up one level
    previousPath = paths.slice(1, -1).join('/');
  }
  const previousPathName = previousPath || defaultTitle;
  const previousPathRoute = previousPath ? `/${previousPath}` : '/';

  return (
    <HeaderLink
      link={
        preventReturnToPrevious
          ? undefined
          : { url: previousPathRoute, label: previousPathName }
      }
      title={formatTitle}
      className={className}
    />
  );
};
