import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';
import Link from 'next/link';

import DocumentsList from '@/components/documents-list/DocumentsList';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getCorrespondenceDocuments } from '@/services/policy';
import { ExtendedDocumentMeta } from '@/types/document';
import { PolicyRequestInputs } from '@/types/policy';

import documentStyles from './Documents.module.css';

const pageTitle = getPageTitle(RouteKey.DOCUMENTS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

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
      recipient: 'Client',
    }
  );

  const isStatementsSelected = searchParams.type === 'statements';

  const statementsFilter = (doc: ExtendedDocumentMeta) =>
    StatementDocumentTypes.includes(doc.documentType as string);
  const docs =
    data?.items?.filter(doc =>
      isStatementsSelected ? statementsFilter(doc) : !statementsFilter(doc)
    ) ?? [];

  return (
    <div className="container">
      <ul className={documentStyles.nav}>
        <li>
          <Link
            href={`/coverage/${params.planCode}/${params.policyNumber}/documents`}
            className={`${!isStatementsSelected ? documentStyles.active : ''}`}
          >
            Documents
          </Link>
        </li>
        <li>
          <Link
            href={`/coverage/${params.planCode}/${params.policyNumber}/documents?type=statements`}
            className={`${isStatementsSelected ? documentStyles.active : ''}`}
          >
            Statements
          </Link>
        </li>
      </ul>
      {error || data?.count === 0 ? (
        <NoDataAvailable
          message={
            isStatementsSelected
              ? 'No statements available.'
              : 'No documents available.'
          }
          iconType={IconType.DOCUMENT_DUPLICATE}
        />
      ) : (
        <DocumentsList
          docCategory={isStatementsSelected ? 'statements' : 'documents'}
          documents={docs}
          planCode={params.planCode}
          policyNumber={params.policyNumber}
        />
      )}
    </div>
  );
}
