'use client';
import { toTitleCase } from '@zinnia/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { RouteKey, getPageTitle } from '@/route-map';
import { LineOfBusinessPath } from '@/types';

import styles from './Breadcrumbs.module.css';

interface Breadcrumb {
  url: string;
  title: string;
}

export const BreadCrumbs = () => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[] | null>(null);
  const pathname = usePathname();

  const params = useParams<{
    planCode: string;
    policyNumber: string;
    beneficiary: string;
  }>();

  useEffect(() => {
    const pathParts = pathname.split('/');
    const pathPartsCount = pathParts.length;
    if (pathParts[pathPartsCount - 1] === params.policyNumber) {
      setBreadcrumbs(null);
      return;
    }

    const breadcrumbsList = [];
    for (let i = pathPartsCount - 1; i >= 0; i--) {
      const currentPathPart = pathParts[i];
      const breadcrumbUrl = pathParts.slice(0, i + 1).join('/');
      // if the current path part is the policy number it means we have reached the policy overview
      // and we can return after adding this breadcrumb
      if (currentPathPart === params.policyNumber) {
        const overviewTitle =
          pathParts[2] === LineOfBusinessPath.ANNUITIES
            ? 'contract overview'
            : 'policy overview';

        breadcrumbsList.unshift({
          title: toTitleCase(overviewTitle),
          url: breadcrumbUrl,
        });
        break;
        // if the beneficiary id is the route key it means we are on a Beneficiary Detail page
      } else if (currentPathPart === params.beneficiary) {
        breadcrumbsList.unshift({
          title: getPageTitle(RouteKey.BENEFICIARY),
          url: breadcrumbUrl,
        });
      } else {
        const title = getPageTitle(
          `/${currentPathPart}` as RouteKey,
          pathParts[2] as LineOfBusinessPath
        );
        breadcrumbsList.unshift({ title, url: breadcrumbUrl });
      }
    }
    setBreadcrumbs(breadcrumbsList);
  }, [pathname, params.beneficiary, params.policyNumber]);

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.breadcrumbs} mb-xl`}>
      {breadcrumbs?.map((breadcrumb, index) => {
        // If on current page, breadcrumb doesn't need to be a link
        if (index === breadcrumbs.length - 1) {
          return <span key={breadcrumb.title}>{breadcrumb.title}</span>;
        }

        return (
          <span key={breadcrumb.title}>
            <Link href={breadcrumb.url} prefetch>
              {breadcrumb.title}
            </Link>
          </span>
        );
      })}
    </div>
  );
};
