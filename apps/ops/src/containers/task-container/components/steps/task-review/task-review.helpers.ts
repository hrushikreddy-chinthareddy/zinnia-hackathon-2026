import { useCallback, useState } from 'react';

import { TaskDocument, DocumentSource } from '@deps/models/case/task-instance';

export const useGetCaseDocs = (): [boolean, any, TaskDocument[] | undefined, TaskDocument[] | undefined] => {
    const [loading, setLoading] = useState(false);
    const [workingDocument, setWorkingDocument] = useState<TaskDocument[]>();
    const [relatedDocument, setRelatedDocument] = useState<TaskDocument[]>();
    const getCaseDocs = useCallback(
        async (documents: TaskDocument[]) => {
            if (loading) return;

            try {
                setLoading(true);
                if (documents) {
                    const workingDoc = documents.filter(item => item.documentSource === DocumentSource.Working);
                    const relatedDoc = [] as TaskDocument[];
                    setWorkingDocument(workingDoc);
                    setRelatedDocument(relatedDoc);
                }
                setLoading(false);
            } catch (e) {
                console.error('useGetCaseDocs:: Error getting documents', e);
                setLoading(false);
            }
        },
        [loading]
    );

    return [loading, getCaseDocs, workingDocument, relatedDocument];
};
