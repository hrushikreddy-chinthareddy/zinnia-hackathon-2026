'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Link } from '@/components/link/Link';

import breadcrumbStyles from './PolicyDetailPageHeader.module.css';
import {
  Breadcrumb,
  getPageTitleByPathPart,
  lastPathPart,
  lineOfBusinessPath,
} from './utils';

export const Breadcrumbs = ({
  lineOfBusiness,
}: {
  lineOfBusiness?: LineOfBusiness;
}) => {
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
    // If the last path part is the policy number, it means user is on the overview page
    // and we do not show breadcrumbs
    if (lastPathPart(pathname) === params.policyNumber) {
      setBreadcrumbs(null);
      return;
    }

    const breadcrumbsList = [];
    for (let i = pathPartsCount - 1; i >= 0; i--) {
      const currentPathPart = pathParts[i];
      const breadcrumbUrl = pathParts.slice(0, i + 1).join('/');
      const pageTitle = getPageTitleByPathPart({
        lineOfBusiness: lineOfBusinessPath(pathname),
        pathPart: currentPathPart || '',
        policyNumber: params.policyNumber,
        beneficiaryKey: params.beneficiary,
      });

      breadcrumbsList.unshift({
        title: pageTitle,
        url: breadcrumbUrl,
      });
      // if the current path part is the policy number it means we have reached the policy overview
      // and we can return after adding this breadcrumb
      if (currentPathPart === params.policyNumber) {
        break;
      }
    }

    setBreadcrumbs(breadcrumbsList);
  }, [pathname, params.beneficiary, params.policyNumber, lineOfBusiness]);

  return (
    <div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className={`${breadcrumbStyles.breadcrumbs} mb-xl`}>
          {breadcrumbs?.map((breadcrumb, index) => {
            // If on current page, breadcrumb doesn't need to be a link
            if (index === breadcrumbs.length - 1) {
              return <span key={breadcrumb.title}>{breadcrumb.title}</span>;
            }

            return (
              <span key={breadcrumb.title}>
                <Link isInternal href={breadcrumb.url} prefetch>
                  {breadcrumb.title}
                </Link>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
