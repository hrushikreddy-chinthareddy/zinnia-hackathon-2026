'use client';
import { useParams, usePathname } from 'next/navigation';
import { PropsWithChildren, useMemo } from 'react';

import styles from '@/app/(authenticated)/coverage/shared-styles/Layout.module.css';

import { Breadcrumbs } from './Breadcrumbs';
import {
  getPageTitleByPathPart,
  lastPathPart,
  lineOfBusinessPath,
} from './utils';
import { AnalyticsPageHeader } from '../analytics/AnalyticsPageHeader';

export const PolicyDetailPageHeader: React.FC<PropsWithChildren> = ({
  children,
}) => {
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
    <div>
      <Breadcrumbs />
      <div className={styles.headerContainer}>
        <AnalyticsPageHeader
          pageTitle={pageTitle}
          analyticsProps={{
            policyNumber: params.policyNumber,
          }}
        />
        {children}
      </div>
    </div>
  );
};
