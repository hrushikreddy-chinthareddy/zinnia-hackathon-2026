import { useCallback, useState } from 'react';

import { PolicyDocuments, PolicyDocument } from '@deps/models/case/document';
import { getPolicyTypeDocs } from '@deps/queries/api/documents';

export const useGetPolicyTypeDocs = (id: string, clientCode: string, docType: string, documentNumber: string): [boolean, () => void, any, any] => {
    const [loading, setLoading] = useState(false);
    const [workingDocument, setWorkingDocument] = useState<PolicyDocument>();
    const [relatedDocument, setRelatedDocument] = useState<PolicyDocument[]>();
    const getPolicyDocs = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);

            const response = await getPolicyTypeDocs(id, clientCode, docType);
            const items = (response.data as PolicyDocuments)?.items || [];

            if (items) {
                const workingDoc = items.find(item => item.documentNumber === documentNumber);
                const relatedDoc = items.filter(item => item.documentNumber !== documentNumber);
                setWorkingDocument(workingDoc);
                setRelatedDocument(relatedDoc);
            }
            setLoading(false);
        } catch (e) {
            console.error('useGetPolicyTypeDocs::error validating address', e);
            setLoading(false);
        }
    }, [loading, id, clientCode, docType, documentNumber]);

    return [loading, getPolicyDocs, workingDocument, relatedDocument];
};