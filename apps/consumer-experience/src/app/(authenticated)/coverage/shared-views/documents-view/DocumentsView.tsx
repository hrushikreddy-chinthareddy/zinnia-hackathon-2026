// ATTENTION!!!!!!! This file exists becuase the documents view is currently exactly the same
// between policies and annuities. If this changes, don't think too much about it just separate them
// and return this to the page view rather than having it as a separate view.

import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import DocumentsWithPagination from '@/components/documents-list/DocumentsWithPagination';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getDocumentsV2, getTaxDocumentsV2 } from '@/services/document/v2';
import { searchDocumentsV3, getTaxDocumentsV3 } from '@/services/document/v3';
import { getFeatureFlags } from '@/services/feature-flags';
import { getPolicyDetails } from '@/services/policy';
import {
  DocumentCategory,
  DocumentV3SearchItem,
  ExtendedDocumentMeta,
} from '@/types/document';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { DocumentsTabs } from './DocumentsTabs';

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
// This is the maximum number of years retrievable by the API
const maxTaxYears = 5;

export const DocumentsView = async ({
  planCode,
  policyNumber,
  lineOfBusiness,
  currentView,
}: {
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
  currentView?: DocumentCategory;
}) => {
  const flags = await getFeatureFlags();
  const loggingContext = await buildCommonLogContext();
  const { data: policyData, error: policyError } = await getPolicyDetails(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );
  const showTaxDocuments = flags?.[FEATURE_FLAGS.VIEW_TAX_DOCUMENTS];
  const shouldUseV3 = flags?.[FEATURE_FLAGS.DOCUMENTS_V3];
  const [correspondenceDocsRes, taxDocsRes] = await Promise.allSettled([
    shouldUseV3
      ? searchDocumentsV3({
          documentClassification: SearchRequest.documentClassification.OUTBOUND,
          parentCarrierCode: policyData?.carrierId,
          policyNumber: policyNumber,
          recipient: 'CLIENT',
        })
      : getDocumentsV2({
          clientCode: policyData?.carrierId,
          contractNumber: policyNumber,
          recipient: 'Client',
          source: 'Correspondence',
        }),
    shouldUseV3
      ? getTaxDocumentsV3({
          clientCode: policyData?.carrierId,
          contractNumber: policyNumber,
          numYears: maxTaxYears,
        })
      : getTaxDocumentsV2({
          clientCode: policyData?.carrierId,
          contractNumber: policyNumber,
          numYears: maxTaxYears,
        }),
  ]);

  const correspondenceDocs =
    correspondenceDocsRes.status === 'fulfilled'
      ? correspondenceDocsRes.value.data
      : null;
  const taxDocs =
    taxDocsRes.status === 'fulfilled' ? taxDocsRes.value.data : null;

  /**
   * Checks if a document type is a statement type.
   * @param doc the document to check
   * @returns true if the document type is a statement type, false otherwise
   */
  const statementsFilter = (doc: ExtendedDocumentMeta | DocumentV3SearchItem) =>
    StatementDocumentTypes.includes(doc.documentType as string);

  const activeTab = currentView || DocumentCategory.DOCUMENTS;
  const currentViewDocs = () => {
    switch (activeTab) {
      case DocumentCategory.DOCUMENTS:
        return (correspondenceDocs?.documents?.filter(
          doc => !statementsFilter(doc)
        ) ?? []) as ExtendedDocumentMeta[] | DocumentV3SearchItem[];
      case DocumentCategory.STATEMENTS:
        return (correspondenceDocs?.documents?.filter(statementsFilter) ??
          []) as ExtendedDocumentMeta[] | DocumentV3SearchItem[];
      case DocumentCategory.TAX:
        return taxDocs?.items ?? [];
      default:
        return [];
    }
  };

  if (!policyData || policyError || !policyData.carrierId) {
    return (
      <NoDataAvailable
        message={`Something went wrong. Please try again later.`}
        iconType={IconType.DOCUMENT_DUPLICATE}
      />
    );
  }

  return (
    <div className="container">
      <DocumentsTabs
        lineOfBusiness={lineOfBusiness}
        planCode={planCode}
        policyNumber={policyNumber}
        activeTab={activeTab}
        showTaxDocuments={showTaxDocuments}
      />
      <DocumentsWithPagination
        docCategory={activeTab}
        documents={currentViewDocs()}
        planCode={planCode}
        policyNumber={policyNumber}
        lineOfBusiness={LineOfBusiness.LIFE}
        carrierId={policyData.carrierId}
      />
    </div>
  );
};
