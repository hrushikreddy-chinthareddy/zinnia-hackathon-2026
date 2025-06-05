'use client';
import { useParams, usePathname } from 'next/navigation';
import { useMemo } from 'react';

import styles from '@/app/(authenticated)/coverage/shared-styles/Layout.module.css';
import { HeaderPolicyDetails } from '@/components/policy-detail-page-header/header-policy-details/HeaderPolicyDetails';
import { lineOfBusinessFromPathname } from '@/utils/data';

import { Breadcrumbs } from './Breadcrumbs';
import {
  getPageTitleByPathPart,
  lastPathPart,
  lineOfBusinessPath,
} from './utils';
import { AnalyticsPageHeader } from '../analytics/AnalyticsPageHeader';
import { ClientOnly } from '../client-only/ClientOnly';

export const PolicyDetailPageHeader = () => {
  const params = useParams<{
    planCode: string;
    policyNumber: string;
    beneficiary: string;
  }>();
  const pathname = usePathname();
  const pageTitle = useMemo(() => {
    return getPageTitleByPathPart({
      lineOfBusiness: lineOfBusinessPath(pathname),
      pathPart: lastPathPart(pathname) || '',
      policyNumber: params.policyNumber,
      beneficiaryKey: params.beneficiary,
    });
  }, [params.beneficiary, params.policyNumber, pathname]);

  return (
    <ClientOnly>
      <div>
        <Breadcrumbs />
        <div className={styles.headerContainer}>
          <AnalyticsPageHeader
            pageTitle={pageTitle}
            analyticsProps={{
              policyNumber: params.policyNumber,
            }}
          />
          <HeaderPolicyDetails
            className={styles.policyDetails}
            planCode={params.planCode}
            policyNumber={params.policyNumber}
            lineOfBusiness={lineOfBusinessFromPathname(pathname)}
          />
        </div>
      </div>
    </ClientOnly>
  );
};
