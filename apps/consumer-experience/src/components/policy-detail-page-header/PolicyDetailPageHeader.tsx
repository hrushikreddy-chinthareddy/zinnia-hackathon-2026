'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { useParams, usePathname } from 'next/navigation';
import { useMemo } from 'react';

import styles from '@/app/(authenticated)/coverage/shared-styles/Layout.module.css';
import { HeaderPolicyDetails } from '@/components/policy-detail-page-header/header-policy-details/HeaderPolicyDetails';

import { Breadcrumbs } from './Breadcrumbs';
import {
  getPageTitleByPathPart,
  lastPathPart,
  lineOfBusinessPath,
} from './utils';
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
          <h1 className="typography-desktop-headline-1d">{pageTitle}</h1>
          <HeaderPolicyDetails
            className={styles.policyDetails}
            planCode={params.planCode}
            policyNumber={params.policyNumber}
            lineOfBusiness={LineOfBusiness.LIFE}
          />
        </div>
      </div>
    </ClientOnly>
  );
};
