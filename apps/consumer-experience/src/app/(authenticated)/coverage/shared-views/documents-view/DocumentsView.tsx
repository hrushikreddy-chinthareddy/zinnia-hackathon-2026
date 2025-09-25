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
import { getCarrierConfig } from '@/services/carrier-config';
import { getDocumentsV2, getTaxDocumentsV2 } from '@/services/document/v2';
import { getTaxDocumentsV3, searchDocumentsV3 } from '@/services/document/v3';
import { getFeatureFlags } from '@/services/feature-flags';
import { getPolicyDetails } from '@/services/policy';
import { DocumentsVersion } from '@/types/carrier-config';
import { DocumentCategory } from '@/types/document';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { DocumentsTabs } from './DocumentsTabs';
import { extensionsFilter, filterDocuments, filterStatements } from './utils';

const pageTitle = getPageTitle(RouteKey.DOCUMENTS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

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
  const { documents: documentsConfig } = await getCarrierConfig();
  const showTaxDocuments = flags?.[FEATURE_FLAGS.VIEW_TAX_DOCUMENTS];
  const shouldUseV2 =
    !flags?.[FEATURE_FLAGS.DOCUMENTS_V3] ||
    documentsConfig.version === DocumentsVersion.V2;
  const [correspondenceDocsRes, taxDocsRes] = await Promise.allSettled([
    shouldUseV2
      ? getDocumentsV2({
          clientCode: policyData?.carrierId,
          contractNumber: policyNumber,
          recipient: 'Client',
          source: 'Correspondence',
        })
      : searchDocumentsV3({
          documentClassification: SearchRequest.documentClassification.OUTBOUND,
          parentCarrierCode: policyData?.carrierId,
          planCode,
          policyNumber,
          recipient: 'CLIENT',
        }),

    shouldUseV2
      ? getTaxDocumentsV2({
          clientCode: policyData?.carrierId,
          contractNumber: policyNumber,
          numYears: maxTaxYears,
          planCode,
        })
      : getTaxDocumentsV3({
          clientCode: policyData?.carrierId,
          contractNumber: policyNumber,
          numYears: maxTaxYears,
          planCode,
        }),
  ]);

  const correspondenceDocs =
    correspondenceDocsRes.status === 'fulfilled'
      ? correspondenceDocsRes.value.data
      : null;
  const taxDocs =
    taxDocsRes.status === 'fulfilled' ? taxDocsRes.value.data : null;

  const filteredCorrespondenceDocs =
    correspondenceDocs?.documents?.filter(extensionsFilter);

  const activeTab = currentView || DocumentCategory.DOCUMENTS;
  const currentViewDocs = () => {
    switch (activeTab) {
      case DocumentCategory.DOCUMENTS:
        return filterDocuments(filteredCorrespondenceDocs);
      case DocumentCategory.STATEMENTS:
        return filterStatements(filteredCorrespondenceDocs);
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
