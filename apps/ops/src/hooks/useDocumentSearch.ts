import { MetadataSearchResponse, SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { useCallback, useEffect, useState } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyDocumentApiRequest } from '@deps/models/case/document';
import { searchDocuments } from '@deps/queries/api/client/documents/v3/search';
import { DocumentApiRequestInputs, getDocumentsV2 } from '@deps/queries/api/documents';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

// BPB - toDos:
// see if we can get away with omitting the unmatched, unmapped values of v2
//  - documentNumber - TBD (Rahul)
//  - periods - Works (verify)
//  - recipient - TBD
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
        source: searchBody.documentClassification?.toLowerCase() === 'inbound' ? DocumentTypeView.Policy : DocumentTypeView.Correspondence,
        clientCode: searchBody?.parentCarrierCode || '',
        ...(searchBody?.policyNumber ? { contractNumber: searchBody?.policyNumber } : {}),
        ...(searchBody?.zinniaLiveCaseId ? { contractNumber: searchBody?.zinniaLiveCaseId } : {}),
        ...(searchBody?.documentStatus ? { docStatus: searchBody?.documentStatus?.join(',') } : {}),
        ...(searchBody?.documentDate ? { contractNumber: searchBody?.documentDate } : {}),
        ...(searchBody?.documentStartDate ? { contractNumber: searchBody?.documentStartDate } : {}),
        ...(searchBody?.documentEndDate ? { contractNumber: searchBody?.documentEndDate } : {}),
        limit,
        offset,
    };
};

// Note: this is a hack to allow v2-routed results to work when being routed through v3
const getDocumentSourceForV2 = (doc: MetadataSearchResponse, searchBody: SearchRequest): DocumentTypeView => {
    const classification = doc.documentClassification || searchBody?.documentClassification;
    switch (classification) {
        case SearchRequest.documentClassification.OUTBOUND:
            return DocumentTypeView.Correspondence;
        case SearchRequest.documentClassification.INBOUND:
        default:
            return DocumentTypeView.Policy;
    }
};

export const useDocumentSearch = (searchBody: SearchRequest, limit = 25, offset = 0): [any[] | null, boolean, number, number | null] => {
    const { featureFlags } = useOptimizely();
    const [loading, setLoading] = useState(false);
    const [docs, setDocs] = useState<any[] | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [responseStatus, setResponseStatus] = useState<number | null>(null);
    const [loadedForArgs, setLoadedForArgs] = useState('');

    const searchDocs = useCallback(async () => {
        if (loading || loadedForArgs === JSON.stringify({ searchBody, limit, offset })) return;
        setLoading(true);
        try {
            if (featureFlags[FEATURE_FLAGS.DOCUMENTS_V3]) {
                const { data, error } = await searchDocuments({ limit, offset, searchBody });
                // BPB - need to set source for v2 responses somehow
                if (error) {
                    setDocs(null);
                    setResponseStatus(error.status);
                    setTotal(0);
                } else {
                    // Note: this is a hack to allow v2-routed results to work when being routed through v3
                    const docsWithSource = (data?.documents ?? []).map(doc => ({
                        ...doc,
                        documentSource: getDocumentSourceForV2(doc, searchBody),
                    }));
                    setDocs(docsWithSource);
                    setResponseStatus(200);
                    setTotal(data?.totalCount ?? 0);
                }
                setLoading(false);
            } else {
                const v2Args = buildV2SearchArgs({ searchBody, limit, offset });
                const docsResponse = await getDocumentsV2(v2Args);
                if (docsResponse?.status === StatusCode.Okay) {
                    setDocs(
                        (docsResponse as PolicyDocumentApiRequest)?.data?.items?.map(({ documentID, documentId, ...rest }) => {
                            return { documentId: documentId || documentID, documentSource: v2Args.source, ...rest };
                        })
                    );
                    setResponseStatus(docsResponse.status);
                    setTotal((docsResponse as PolicyDocumentApiRequest)?.data?.count);
                } else {
                    console.error('useDocumentSearch::searchDocs error', docsResponse?.status ?? 500);
                    setDocs(null);
                    setResponseStatus(docsResponse?.status ?? 500);
                    setTotal(0);
                }
            }
        } catch (e) {
            console.error('useDocumentSearch::error', (e as Error).message);
            setResponseStatus(500);
            setTotal(0);
            setDocs(null);
        } finally {
            setLoadedForArgs(JSON.stringify({ searchBody, limit, offset }));
            setLoading(false);
        }
    }, [searchBody, limit, offset, featureFlags, loadedForArgs, loading]);

    useEffect(() => {
        searchDocs();
    }, [searchDocs]);

    return [docs, loading, total, responseStatus];
};
