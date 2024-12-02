import { useCallback, useState } from 'react';

import { CaseDocument } from '@deps/models/case/document';
import { getCaseDocuments } from '@deps/queries/api/cases';

export const useGetCaseDocs = (caseId: string, documentNumber: string): [boolean, () => void, any, any] => {
    // const { task } = useContext(TaskDataContext);
    const [loading, setLoading] = useState(false);
    const [workingDocument, setWorkingDocument] = useState<CaseDocument>();
    const [relatedDocument, setRelatedDocument] = useState<CaseDocument[]>();
    const getCaseDocs = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);
            const response = await getCaseDocuments(caseId);
            const items = (response as CaseDocument[]) || [];
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
    }, [loading, caseId, documentNumber]);

    return [loading, getCaseDocs, workingDocument, relatedDocument];
};
