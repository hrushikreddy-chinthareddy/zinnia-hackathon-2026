import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import PdfPreviewer from '@/components/pdf-previewer/PdfPreviewer';
import { RouteKey, getPageTitle } from '@/route-map';
import { getDocuments } from '@/services/document';
import { PolicyRequestInputs } from '@/types/policy';
import { POLICY_ACKNOWLEDGEMENT_DOC_TYPE } from '@/utils/data';

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
  const policyDocuments = await getDocuments({
    clientCode: searchParams.clientCode,
    contractNumber: params.policyNumber,
    recipient: 'Client',
    documentType: POLICY_ACKNOWLEDGEMENT_DOC_TYPE,
  });
  const { lineOfBusiness, policyNumber, planCode } = params;
  const { clientCode } = searchParams;
  const document = policyDocuments?.data?.items?.[0];

  const docDownloadUrl = `/api/documents/${document?.documentID || document?.documentId}/download/${document?.fileName}.pdf?clientCode=${clientCode}&policyNumber=${policyNumber}&planCode=${planCode}`;

  return (
    <div style={{ height: '100svh' }}>
      <div className={previewStyles.container}>
        <PdfPreviewer
          defaultRedirectUrl={`/coverage/${lineOfBusiness}/${planCode}/${policyNumber}/documents/error`}
          documentDownloadUrl={docDownloadUrl}
          fileName={document?.fileName || ''}
        />
      </div>
    </div>
  );
}
