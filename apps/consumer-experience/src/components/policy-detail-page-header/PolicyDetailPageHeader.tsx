import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import styles from '@/app/(authenticated)/coverage/shared-styles/Layout.module.css';
import { BreadCrumbs } from '@/components/breadcrumbs/Breadcrumbs';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';

export const PolicyDetailPageHeader = ({
  planCode,
  policyNumber,
  lineOfBusiness,
}: {
  planCode: string;
  policyNumber: string;
  lineOfBusiness?: LineOfBusiness;
}) => {
  return (
    <div>
      <BreadCrumbs />
      <div className={styles.headerContainer}>
        <HeaderBreadcrumb />
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
