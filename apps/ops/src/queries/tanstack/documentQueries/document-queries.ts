import { SearchRequest as DocsSearchRequest } from '@zinnia/api-types/types/documents-v3';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { PolicyDocumentApiRequest } from '@deps/models/case/document';
import { downloadDocumentV2 } from '@deps/queries/api/client/documents/v2/download';
import { getDocumentsV2 } from '@deps/queries/api/client/documents/v2/search';
import { downloadDocumentV3 } from '@deps/queries/api/client/documents/v3/download';
import { searchDocumentsV3 } from '@deps/queries/api/client/documents/v3/search';
import { DocumentApiRequestInputs } from '@deps/queries/api/documents';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { SearchRequest, V3DocumentWithSource } from '@deps/types/documents-v3';
import { b64ToBlob } from '@deps/utils/blob';

const buildV2SearchArgs = ({
    searchBody,
    limit = 25,
    offset = 0,
}: {
    searchBody: SearchRequest;
    limit?: number;
    offset?: number;
}): DocumentApiRequestInputs => {
    return {
        source:
            // TODO MG: util function for this
            searchBody.documentClassification?.toLowerCase() === 'inbound'
                ? DocumentTypeView.Policy
                : DocumentTypeView.Correspondence,
        clientCode: searchBody?.parentCarrierCode || '',
        ...(searchBody?.policyNumber
            ? { contractNumber: searchBody?.policyNumber }
            : {}),
        ...(searchBody?.zinniaLiveCaseId
            ? { zinniaLiveCaseId: searchBody?.zinniaLiveCaseId }
            : {}),
        ...(searchBody?.documentStatus
            ? { docStatus: searchBody?.documentStatus?.join(',') }
            : {}),
        ...(searchBody?.documentDate
            ? { documentDate: searchBody?.documentDate }
            : {}),
        ...(searchBody?.documentStartDate
            ? { documentStartDate: searchBody?.documentStartDate }
            : {}),
        ...(searchBody?.documentEndDate
            ? { documentEndDate: searchBody?.documentEndDate }
            : {}),
        ...(searchBody?.periods ? { periods: searchBody?.periods } : {}),
        limit,
        offset,
    };
};

export const getDocumentDownloadQuery = async (
    documentId: string,
    documentType: DocumentTypeView,
    carrierCode: string,
    fileType: string | undefined,
    useV3: boolean
): Promise<{ blob: Blob; fileExtension: string }> => {
    let doc;
    if (useV3) {
        let docClass;
        switch (documentType) {
            case DocumentTypeView.Correspondence:
                docClass = DocsSearchRequest.documentClassification.OUTBOUND;
                break;
            case DocumentTypeView.Policy:
            default:
                docClass = DocsSearchRequest.documentClassification.INBOUND;
        }
        doc = await downloadDocumentV3(documentId, docClass, carrierCode);
    } else {
        doc = await downloadDocumentV2(documentId, documentType, carrierCode);
    }

    if (!doc || !doc?.binaryData || !doc?.fileExtension) {
        throw 'Invalid doc structure or no document data';
    }
    // this is only necessary until documents v3 is fully live.
    // forces the browser to render emails as .eml instead of .pdf, doc v2 doesn't yet support .eml
    if (fileType == 'email') {
        doc.fileExtension = 'eml';
        doc.mimeType = 'application/eml';
    }

    const docBlob = b64ToBlob(doc.binaryData, doc.mimeType);
    if (!docBlob) {
        console.error('DocumentDownload::download::no-blob');
        throw new Error('No blob created');
    }
    return { blob: docBlob, fileExtension: doc.fileExtension };
};

export const getDocumentSearchResultsQuery = async (
    searchBody: SearchRequest | null,
    limit: number,
    offset: number,
    useV3: boolean
): Promise<{
    data: DocumentWithSource[] | V3DocumentWithSource[] | null;
    status: number;
    total: number;
}> => {
    if (!searchBody) {
        throw 'No search body provided';
    }
    if (useV3) {
        const { data, error } = await searchDocumentsV3({
            limit,
            offset,
            searchBody,
        });
        if (error) {
            return { data: null, status: error.status, total: 0 };
        }
        return {
            data:
                data?.documents?.map((doc) => ({
                    ...doc,
                    documentSource:
                        searchBody.documentClassification?.toLowerCase() ===
                        'inbound'
                            ? DocumentTypeView.Policy
                            : DocumentTypeView.Correspondence,
                })) ?? [],
            status: 200,
            total: data?.totalCount ?? data?.count ?? 0,
        };
    } else {
        const v2Args = buildV2SearchArgs({ searchBody, limit, offset });
        const docsResponse = await getDocumentsV2(v2Args);
        if (docsResponse?.status === StatusCode.Okay) {
            return {
                data: (
                    docsResponse as PolicyDocumentApiRequest
                )?.data?.items?.map(({ documentID, documentId, ...rest }) => {
                    return {
                        documentId: documentId || documentID,
                        documentSource: v2Args.source,
                        ...rest,
                    };
                }),
                status: 200,
                total:
                    (docsResponse as PolicyDocumentApiRequest)?.data?.count ??
                    0,
            };
        } else {
            return {
                data: null,
                status: docsResponse?.status ?? 500,
                total: 0,
            };
        }
    }
};
