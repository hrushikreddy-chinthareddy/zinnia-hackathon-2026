import { IconType } from '@zinnia/bloom/internal/components';
import Link from 'next/link';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableListContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import styles from '@/components/policy-overview/PolicyOverview.module.css';
import { getCorrespondenceDocuments } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';
import { checkIfNull } from '@/utils/data';
import { standardDateMonthYear } from '@/utils/dates';

import documentStyles from './Documents.module.css';
import { ExtendedDocumentMeta } from '@/types/document';

// DocumentTypes for both Old and New Correspondence APIs that map to a statement-y doctype
// https://zinnia.atlassian.net/wiki/spaces/SISED/pages/3834871816/SED+New+Document+Types+-+Next+Gen+Correspondence
// https://zinnia.atlassian.net/wiki/spaces/SISED/pages/3013640218/SED+Document+Types
const StatementDocumentTypes = ['ANNSTM', 'ANNSTME', 'ANN', 'SOA'];

export default async function Documents({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs;
  searchParams: { type: 'statements' | 'documents' };
}) {
  const { data, error } = await getCorrespondenceDocuments(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    {
      contractNumber: params.policyNumber,
      recipient: 'client',
    }
  );

  const isStatementsSelected = searchParams.type === 'statements';

  const statementsFilter = (doc: ExtendedDocumentMeta) =>
    StatementDocumentTypes.includes(doc.documentType as string);
  const docs = data?.items?.filter(doc =>
    isStatementsSelected ? statementsFilter(doc) : !statementsFilter(doc)
  );

  return (
    <div className="container">
      <HeaderBreadcrumb title="Documents" />
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
            className={`${isStatementsSelected ? documentStyles.active : ''}`}
          >
            Statements
          </Link>
        </li>
      </ul>
      {error || data?.count === 0 ? (
        <NoDataAvailable
          message="No documents available."
          iconType={IconType.DOCUMENT_TEXT}
        />
      ) : docs && docs.length > 0 ? (
        <ClickableListContainer
          listItems={docs.map(d => {
            return {
              content: (
                <>
                  <div className={styles.content}>
                    <FieldData caption={standardDateMonthYear(d.documentDate)}>
                      <p className="typography-labels-label-md-alt">
                        {checkIfNull(d.displayName)}
                      </p>
                    </FieldData>
                  </div>
                </>
              ),
              linkTo: {
                isInternal: true,
                url: `/policies/${params.planCode}/${params.policyNumber}/documents/${d.documentId ?? d.documentID}?clientCode=${d.clientCode}&source=${d.downloadSource}`,
                label: `Download Document - ${d.displayName}`,
                iconText: 'View',
              },
            };
          })}
        />
      ) : (
        <NoDataAvailable
          message={`No ${isStatementsSelected ? 'statements' : 'documents'} available.`}
          iconType={IconType.DOCUMENT_TEXT}
        />
      )}
      <CallForAssistance />
      <Footer />
    </div>
  );
}
