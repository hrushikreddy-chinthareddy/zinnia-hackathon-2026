import { SearchRequest } from '@xd/api-types/dist/generated-types/documents-v3';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import PdfPreviewer from '@/components/pdf-previewer/PdfPreviewer';
import { RouteKey, getPageTitle } from '@/route-map';
import { getDocumentsV2 } from '@/services/document/v2';
import { searchDocumentsV3 } from '@/services/document/v3';
import { getFeatureFlags } from '@/services/feature-flags';
import { DocumentV3SearchItem, ExtendedDocumentMeta } from '@/types/document';
import { PolicyRequestInputs } from '@/types/policy';
import { retrieveDocumentsFromV2 } from '@/utils/documents';
import { logInfo } from '@/utils/logging/log-fns';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import previewStyles from '../[documentId]/Preview.module.css';

const pageTitle = getPageTitle(RouteKey.DOCUMENTS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

// CAUTION!!!!!! This endpoint is accessible to users who have not
// acknowledged their policies yet but are required to do so!!! Only
// use this if that is your intention.
export default async function PolicyAcknowledgementDocumentPreview({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs & {
    lineOfBusiness: LineOfBusiness;
  };
  searchParams: {
    clientCode: string;
  };
}) {
  const flags = await getFeatureFlags();
  const { lineOfBusiness, policyNumber, planCode } = params;
  const { clientCode } = searchParams;
  const shouldUseV2 =
    !flags?.[FEATURE_FLAGS.DOCUMENTS_V3] || (await retrieveDocumentsFromV2());

  const policyDocuments = shouldUseV2
    ? await getDocumentsV2({
        clientCode: searchParams.clientCode,
        contractNumber: params.policyNumber,
        recipient: 'Client',
        // This code is different than the one we use to set preferences and
        // check delivery date. This code is specifically for viewing the policy
        // acknowledgement document
        documentType: 'POLPG',
      })
    : await searchDocumentsV3({
        documentType: 'POLPG',
        recipient: 'CLIENT',
        parentCarrierCode: searchParams.clientCode,
        policyNumber: params.policyNumber,
        planCode,
        documentClassification: SearchRequest.documentClassification.OUTBOUND,
      });
  const document = policyDocuments?.data?.documents?.[0];

  logInfo(
    'PolicyAcknowledgementDocumentPreview: view policy acknowledgement document',
    {
      clientCode,
      planCode,
      policyNumber,
      lineOfBusiness,
      documentId: document?.documentId,
    }
  );

  const fileName =
    (document as ExtendedDocumentMeta)?.fileName ||
    (document as DocumentV3SearchItem)?.sourceFileName ||
    '';

  const docDownloadUrl = shouldUseV2
    ? `/api/documents/${document?.documentId}/download/${fileName}.pdf?clientCode=${clientCode}&policyNumber=${policyNumber}&planCode=${planCode}`
    : `/api/documents/v3/${document?.documentId}/download/${fileName}?parentCarrierCode=${clientCode}&policyNumber=${policyNumber}&planCode=${planCode}`;

  return (
    <div style={{ height: '100svh' }}>
      <div className={previewStyles.container}>
        <PdfPreviewer
          defaultRedirectUrl={`/coverage/${lineOfBusiness}/${planCode}/${policyNumber}/documents/error`}
          documentDownloadUrl={docDownloadUrl}
          fileName={fileName}
        />
      </div>
    </div>
  );
}
