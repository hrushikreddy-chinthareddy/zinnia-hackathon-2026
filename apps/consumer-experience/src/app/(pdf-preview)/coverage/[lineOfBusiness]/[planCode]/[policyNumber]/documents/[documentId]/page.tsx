import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import PdfPreviewer from '@/components/pdf-previewer/PdfPreviewer';
import { RouteKey, getPageTitle } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { DocumentCategory } from '@/types/document';
import { PolicyRequestInputs } from '@/types/policy';
import { retrieveDocumentsFromV2 } from '@/utils/documents';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { createQueryString } from '@/utils/strings';

import previewStyles from './Preview.module.css';

const pageTitle = getPageTitle(RouteKey.DOCUMENTS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function DocumentPreview({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs & { documentId: string } & {
    lineOfBusiness: LineOfBusiness;
  };
  searchParams: {
    source: string;
    clientCode: string;
    fileName: string;
    docCategory: DocumentCategory;
  };
}) {
  const flags = await getFeatureFlags();
  const shouldUseV2 =
    !flags?.[FEATURE_FLAGS.DOCUMENTS_V3] || retrieveDocumentsFromV2();
  const { lineOfBusiness, documentId, ...otherParams } = params;
  const { fileName, ...otherSearchParams } = searchParams;
  let docDownloadUrl;
  if (shouldUseV2) {
    const queryParamString = createQueryString({
      ...otherParams,
      ...otherSearchParams,
    });
    docDownloadUrl =
      searchParams.docCategory === DocumentCategory.TAX
        ? `/api/documents/tax-docs/${documentId}/download/${fileName}.pdf?${queryParamString}`
        : `/api/documents/${documentId}/download/${fileName}.pdf?${queryParamString}`;
  } else {
    const queryParamString = createQueryString({
      ...otherParams,
      ...otherSearchParams,
      parentCarrierCode: searchParams.clientCode,
      documentClassification: searchParams.source,
    });
    docDownloadUrl =
      searchParams.docCategory === DocumentCategory.TAX
        ? `/api/documents/v3/tax-docs/${documentId}/download/${fileName}.pdf?${queryParamString}`
        : `/api/documents/v3/${documentId}/download/${fileName}.pdf?${queryParamString}`;
  }

  return (
    <div style={{ height: '100svh' }}>
      <div className={previewStyles.container}>
        <PdfPreviewer
          defaultRedirectUrl={`/coverage/${lineOfBusiness}/${params.planCode}/${params.policyNumber}/documents/error`}
          documentDownloadUrl={docDownloadUrl}
          fileName={fileName}
        />
      </div>
    </div>
  );
}
