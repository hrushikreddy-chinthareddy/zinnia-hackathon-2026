import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { downloadDocumentV2 } from '@deps/queries/api/client/documents/v2/download';
import { downloadDocumentV3 } from '@deps/queries/api/client/documents/v3/download';
import { searchDocumentsV3 } from '@deps/queries/api/client/documents/v3/search';
import { SearchRequest, V3DocumentWithSource } from '@deps/types/documents-v3';
import { b64ToBlob } from '@deps/utils/blob';
import { browserLogInfo } from '@deps/utils/browser-logging';
import { DocumentClassificationEnum as DocsDocumentClassificationEnum } from '@zinnia/api-types/types/documents-v3';

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
                docClass = DocsDocumentClassificationEnum.OUTBOUND;
                break;
            case DocumentTypeView.Policy:
            default:
                docClass = DocsDocumentClassificationEnum.INBOUND;
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
    offset: number
): Promise<{
    data: V3DocumentWithSource[] | null;
    status: number;
    total: number;
}> => {
    if (!searchBody) {
        throw 'No search body provided';
    }
    browserLogInfo('getDocumentSearchResultsQuery::searchBody', {
        searchBody,
        limit,
        offset,
    });
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
};
