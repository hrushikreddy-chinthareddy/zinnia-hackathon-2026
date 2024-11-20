import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';
import Link from 'next/link';

import documentStyles from '@/app/(authenticated)/coverage/shared-styles/Documents.module.css';
import DocumentsList from '@/components/documents-list/DocumentsList';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getDocuments, getTaxDocuments } from '@/services/document';
import { getFeatureFlags } from '@/services/feature-flags';
import { getPolicyDetails } from '@/services/policy';
import { LineOfBusinessPath } from '@/types';
import { DocumentCategory, ExtendedDocumentMeta } from '@/types/document';
import { PolicyRequestInputs } from '@/types/policy';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

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
  searchParams: { type: DocumentCategory };
}) {
  const flags = await getFeatureFlags();
  const { data: policyData, error: policyError } =
    await getPolicyDetails(params);
  const showTaxDocuments = flags?.[FEATURE_FLAGS.VIEW_TAX_DOCUMENTS];

  const [correspondenceDocsRes, taxDocsRes] = await Promise.allSettled([
    getDocuments({
      clientCode: policyData?.carrierId,
      source: 'Correspondence',
      contractNumber: params.policyNumber,
      recipient: 'Client',
    }),
    getTaxDocuments({
      clientCode: policyData?.carrierId,
      contractNumber: params.policyNumber,
      taxYear: new Date().getFullYear().toString(),
      numYears: 1,
    }),
  ]);

  const correspondenceDocs =
    correspondenceDocsRes.status === 'fulfilled'
      ? correspondenceDocsRes.value.data
      : null;
  const taxDocs =
    taxDocsRes.status === 'fulfilled' ? taxDocsRes.value.data : null;

  const activeTab = searchParams.type || DocumentCategory.DOCUMENTS;
  /**
   * Checks if a document type is a statement type.
   * @param doc the document to check
   * @returns true if the document type is a statement type, false otherwise
   */
  const statementsFilter = (doc: ExtendedDocumentMeta) =>
    StatementDocumentTypes.includes(doc.documentType as string);

  const docs = () => {
    switch (activeTab) {
      case DocumentCategory.DOCUMENTS:
        return (
          correspondenceDocs?.items?.filter(doc => !statementsFilter(doc)) ?? []
        );
      case DocumentCategory.STATEMENTS:
        return correspondenceDocs?.items?.filter(statementsFilter) ?? [];
      case DocumentCategory.TAX:
        return taxDocs?.items ?? [];
      default:
        return [];
    }
  };

  return (
    <div className="container">
      <ul className={documentStyles.nav}>
        <li>
          <Link
            href={`/coverage/${LineOfBusinessPath.POLICIES}/${params.planCode}/${params.policyNumber}/documents`}
            className={`${activeTab === DocumentCategory.DOCUMENTS ? documentStyles.active : ''}`}
          >
            Documents
          </Link>
        </li>
        <li>
          <Link
            href={`/coverage/${LineOfBusinessPath.POLICIES}/${params.planCode}/${params.policyNumber}/documents?type=${DocumentCategory.STATEMENTS}`}
            className={`${activeTab === DocumentCategory.STATEMENTS ? documentStyles.active : ''}`}
          >
            Statements
          </Link>
        </li>
        {showTaxDocuments && (
          <li>
            <Link
              href={`/coverage/${LineOfBusinessPath.POLICIES}/${params.planCode}/${params.policyNumber}/documents?type=${DocumentCategory.TAX}`}
              className={`${activeTab === DocumentCategory.TAX ? documentStyles.active : ''}`}
            >
              Tax Documents
            </Link>
          </li>
        )}
      </ul>
      {/* TODO: what should the error state check for? */}
      {/* {policyError || data?.count === 0 ? ( */}
      {policyError ? (
        <NoDataAvailable
          message={`Something went wrong. Please try again later.`}
          iconType={IconType.DOCUMENT_DUPLICATE}
        />
      ) : (
        <DocumentsList
          docCategory={activeTab}
          documents={docs()}
          planCode={params.planCode}
          policyNumber={params.policyNumber}
          lineOfBusiness={LineOfBusiness.LIFE}
        />
      )}
    </div>
  );
}
