import { useCallback, useEffect, useState } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyDocumentApiRequest } from '@deps/models/case/document';
import { getDocumentsV2 } from '@deps/queries/api/client/documents/v2/search';
import { searchDocumentsV3 } from '@deps/queries/api/client/documents/v3/search';
import { DocumentApiRequestInputs } from '@deps/queries/api/documents';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { SearchRequest, V3DocumentWithSource } from '@deps/types/documents-v3';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

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
        ...(searchBody?.zinniaLiveCaseId ? { zinniaLiveCaseId: searchBody?.zinniaLiveCaseId } : {}),
        ...(searchBody?.documentStatus ? { docStatus: searchBody?.documentStatus?.join(',') } : {}),
        ...(searchBody?.documentDate ? { documentDate: searchBody?.documentDate } : {}),
        ...(searchBody?.documentStartDate ? { documentStartDate: searchBody?.documentStartDate } : {}),
        ...(searchBody?.documentEndDate ? { documentEndDate: searchBody?.documentEndDate } : {}),
        ...(searchBody?.periods ? { periods: searchBody?.periods } : {}),
        limit,
        offset,
    };
};

export const useDocumentSearch = (
    searchBody: SearchRequest,
    limit = 25,
    offset = 0
): [DocumentWithSource[] | V3DocumentWithSource[] | null, boolean, number, number | null] => {
    const { featureFlags } = useOptimizely();
    const [loading, setLoading] = useState(false);
    const [docs, setDocs] = useState<DocumentWithSource[] | V3DocumentWithSource[] | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [responseStatus, setResponseStatus] = useState<number | null>(null);
    const [loadedForArgs, setLoadedForArgs] = useState('');

    const searchDocs = useCallback(async () => {
        if (loading || loadedForArgs === JSON.stringify({ searchBody, limit, offset })) return;
        setLoading(true);
        try {
            if (featureFlags[FEATURE_FLAGS.DOCUMENTS_V3]) {
                const { data, error } = await searchDocumentsV3({ limit, offset, searchBody });

                if (error) {
                    setDocs(null);
                    setResponseStatus(error.status);
                    setTotal(0);
                } else {
                    setDocs(
                        (data?.documents ?? []).map(doc => {
                            return {
                                ...doc,
                                documentSource:
                                    searchBody.documentClassification?.toLowerCase() === 'inbound'
                                        ? DocumentTypeView.Policy
                                        : DocumentTypeView.Correspondence,
                            };
                        })
                    );
                    setResponseStatus(200);
                    setTotal(data?.totalCount ?? data?.count ?? 0);
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
