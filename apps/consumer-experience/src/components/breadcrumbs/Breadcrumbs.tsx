'use client';
import { toTitleCase } from '@zinnia/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { RouteKey, getPageTitle } from '@/route-map';
import { LineOfBusinessPath } from '@/types';

import styles from './Breadcrumbs.module.css';

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

interface Breadcrumb {
  url: string;
  title: string;
}

// TODO: do i need to account for the title prop? I think it's only used with HeaderBreadcrumb component without the breadcrumbs
export const BreadCrumbs = ({ title }: HeaderBreadcrumbProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[] | null>(null);
  const pathname = usePathname();
  const paths = (pathname || '').split('/');
  console.log(paths);
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
    const pathParts = pathname.split('/');
    const pathPartsCount = pathParts.length;

    // loop over paths starting from the end
    // for each unshift onto breadcrumbs array
    // once you get to the policy number return out of the function
    const breadcrumbsList = [];
    for (let i = pathPartsCount - 1; i >= 0; i--) {
      const currentPathPart = pathParts[i];
      const pathPartUrl = pathParts.slice(0, i + 1).join('/');
      // if the current path part is the policy number it means we have reached the point where
      // we don't include breadcrumbs
      if (currentPathPart === params.policyNumber) {
        break;
        // if the beneficiary id is the route key it means we are on a Beneficiary Detail page
      } else if (currentPathPart === params.beneficiary) {
        const title = getPageTitle(RouteKey.BENEFICIARY);
        breadcrumbsList.unshift({ title, url: pathPartUrl });
      } else {
        const title =
          getPageTitle(
            `/${currentPathPart}` as RouteKey,
            pathParts[2] as LineOfBusinessPath
          ) ?? toTitleCase(defaultTitle);
        breadcrumbsList.unshift({ title, url: pathPartUrl });
      }
    }
    setBreadcrumbs(breadcrumbsList);
  }, [pathname, params.beneficiary, params.policyNumber, defaultTitle]);

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={styles.breadcrumbs}>
      {breadcrumbs?.map(breadcrumb => (
        <Link
          href={breadcrumb.url}
          className={breadcrumb.url === pathname ? styles.active : ''}
        >
          {breadcrumb.title}
        </Link>
      ))}
    </div>
    // <Link
    //   href={previousPathRoute}
    //   aria-label={previousPathName}
    //   // className={styles.headerLinkAction}
    //   prefetch
    // >
    //   {formatTitle}
    // </Link>
  );
};
