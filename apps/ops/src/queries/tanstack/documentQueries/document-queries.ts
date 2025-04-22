import { SearchRequest } from '@zinnia/api-types/types/documents-v3';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { buildV2SearchArgs } from '@deps/hooks/useDocumentSearch';
import { PolicyDocumentApiRequest } from '@deps/models/case/document';
import { getDocumentsV2 } from '@deps/queries/api/client/documents/v2/search';
import { searchDocumentsV3 } from '@deps/queries/api/client/documents/v3/search';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { V3DocumentWithSource } from '@deps/types/documents-v3';

export const getDocumentSearchResultsQuery = async (
    searchBody: SearchRequest | null,
    limit: number,
    offset: number,
    useV3: boolean
): Promise<{ data: DocumentWithSource[] | V3DocumentWithSource[] | null; status: number; total: number }> => {
    if (!searchBody) {
        throw 'No search body provided';
    }
    if (useV3) {
        const { data, error } = await searchDocumentsV3({ limit, offset, searchBody });
        if (error) {
            return { data: null, status: error.status, total: 0 };
        }
        return {
            data:
                data?.documents?.map(doc => ({
                    ...doc,
                    documentSource:
                        searchBody.documentClassification?.toLowerCase() === 'inbound'
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
                data: (docsResponse as PolicyDocumentApiRequest)?.data?.items?.map(({ documentID, documentId, ...rest }) => {
                    return { documentId: documentId || documentID, documentSource: v2Args.source, ...rest };
                }),
                status: 200,
                total: (docsResponse as PolicyDocumentApiRequest)?.data?.count ?? 0,
            };
        } else {
            return { data: null, status: docsResponse?.status ?? 500, total: 0 };
        }
    }
};
