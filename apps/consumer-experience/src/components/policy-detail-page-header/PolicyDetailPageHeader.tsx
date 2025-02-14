'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { toTitleCase } from '@zinnia/utils';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from '@/app/(authenticated)/coverage/shared-styles/Layout.module.css';
import { HeaderPolicyDetails } from '@/components/policy-detail-page-header/header-policy-details/HeaderPolicyDetails';

import breadcrumbStyles from './PolicyDetailPageHeader.module.css';
import { Breadcrumb, generateBreadcrumbs } from './utils';

export const PolicyDetailPageHeader = ({
  planCode,
  policyNumber,
  lineOfBusiness,
}: {
  planCode: string;
  policyNumber: string;
  lineOfBusiness?: LineOfBusiness;
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[] | null>(null);
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState('');
  const params = useParams<{
    planCode: string;
    policyNumber: string;
    beneficiary: string;
  }>();
  const overviewTitle =
    lineOfBusiness === LineOfBusiness.ANNUITY
      ? 'contract overview'
      : 'policy overview';

  useEffect(() => {
    const pathParts = pathname.split('/');
    const pathPartsCount = pathParts.length;
    if (pathParts[pathPartsCount - 1] === params.policyNumber) {
      setPageTitle(toTitleCase(overviewTitle));
      setBreadcrumbs(null);
      return;
    }

    const breadcrumbsList = generateBreadcrumbs({
      pathParts,
      policyNumber: params.policyNumber,
      beneficiaryKey: params.beneficiary,
      rootPageTitle: overviewTitle,
    });

    setBreadcrumbs(breadcrumbsList);
    setPageTitle(breadcrumbsList[breadcrumbsList.length - 1]?.title || '');
  }, [pathname, params.beneficiary, params.policyNumber, overviewTitle]);

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
                <Link href={breadcrumb.url} prefetch>
                  {breadcrumb.title}
                </Link>
              </span>
            );
          })}
        </div>
      )}
      <div className={styles.headerContainer}>
        <h1 className="typography-desktop-headline-1d">{pageTitle}</h1>
        <HeaderPolicyDetails
          className={styles.policyDetails}
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={lineOfBusiness}
        />
      </div>
    </div>
  );
};
