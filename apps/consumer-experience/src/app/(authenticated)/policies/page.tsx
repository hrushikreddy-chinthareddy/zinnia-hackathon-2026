import { Label } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import MockMessage from '@/components/MockMessage';
import styles from '@/components/policy-overview/PolicyOverview.module.css';
import { getMyPoliciesByCarrier } from '@/services';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'My Policies',
};

export default async function Page() {
  const { data: policyReferenceData, error } =
    await getMyPoliciesByCarrier('SBUL');

  if (error) {
    return (
      <>
        <HeaderBreadcrumb title="My Policies" />
        <div className={styles.cardContainer}>
          <MockMessage />
        </div>
      </>
    );
  }

  if (policyReferenceData?.length === 1) {
    const [policyReference] = policyReferenceData;
    return redirect(
      `/policies/${policyReference?.planCode}/policy/${policyReference?.policyNumber}`
    );
  }

  return (
    <>
      <HeaderBreadcrumb title="My Policies" />
      <div className={`${styles.cardContainer} ${styles.container}`}>
        {policyReferenceData?.map(p => (
          <ClickableCardContainer
            key={p.id}
            linkTo={{
              label: `Get details for Policy ${p.productName}`,
              url: `/policies/${p.planCode}/policy/${p.policyNumber}`,
              isInternal: true,
            }}
          >
            <div>
              <h2 className="mb-lg">{p.productName}</h2>
              <FieldData Label={<Label>Policy Number</Label>}>
                <p className="typography-content-body-sm">{p.policyNumber}</p>
              </FieldData>
            </div>
          </ClickableCardContainer>
        ))}
      </div>
    </>
  );
}
