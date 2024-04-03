import { IconType } from '@zinnia/bloom/internal/components';
import Link from 'next/link';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import styles from '@/components/policy-overview/PolicyOverview.module.css';
import { getPolicyDocuments } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';
import { checkIfNull } from '@/utils/data';
import { standardDateMonthYear } from '@/utils/dates';

import documentStyles from './Documents.module.css';

export default async function Documents({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs;
  searchParams: { type: 'statements' | 'documents' };
}) {
  const { data, error } = await getPolicyDocuments(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    {
      // TODO: need to confirm if this is actually the contract number
      contractNumber: params.policyNumber,
    }
  );

  return (
    <div className="container">
      <HeaderBreadcrumb title="Documents" />
      <HeaderPolicyDetails
        policyNumber={params.policyNumber}
        planCode={params.planCode}
      />
      <ul className={documentStyles.nav}>
        <li>
          <Link
            href={`/policies/${params.planCode}/${params.policyNumber}/documents`}
            className={`${!searchParams.type || searchParams.type === 'documents' ? documentStyles.active : ''}`}
          >
            Documents
          </Link>
        </li>
        <li>
          <Link
            href={`/policies/${params.planCode}/${params.policyNumber}/documents?type=statements`}
            className={`${searchParams.type === 'statements' ? documentStyles.active : ''}`}
          >
            Statements
          </Link>
        </li>
      </ul>
      {(error || data?.count === 0) && (
        <NoDataAvailable
          message="No documents available."
          iconType={IconType.DOCUMENT_TEXT}
        />
      )}
      {data && data.items.length > 0 && (
        <div className="card-container">
          {data.items.map(d => {
            return (
              <ClickableCardContainer
                key={d.documentId ?? d.documentID}
                linkTo={{
                  isInternal: true,
                  url: `/policies/${params.planCode}/${params.policyNumber}/documents/${d.documentId ?? d.documentID}`,
                  label: `Download Document - ${d.displayName}`,
                  iconType: IconType.DOWNLOAD,
                }}
              >
                <div className={styles.content}>
                  <FieldData caption={standardDateMonthYear(d.documentDate)}>
                    <p className="typography-labels-label-md-alt">
                      {checkIfNull(d.displayName)}
                    </p>
                  </FieldData>
                </div>
              </ClickableCardContainer>
            );
          })}
        </div>
      )}
      <Footer showAction />
    </div>
  );
}
