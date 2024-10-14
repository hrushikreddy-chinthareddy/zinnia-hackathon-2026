import { useCallback, useState } from 'react';

import { PolicyDocuments, PolicyDocument } from '@deps/models/case/document';
import { getPolicyTypeDocs } from '@deps/queries/api/documents';
import { searchNigoExceptions } from '@deps/queries/api/exception-refs';

import { ExceptionSubRef, SubException, NigoException, NigoSubException } from './nigo-details.types';

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

export const getSubExceptions = (exceptionSubRefs: ExceptionSubRef[]) => {
    const subExceptions: SubException[] = [];
    exceptionSubRefs?.map(({ subNmIdDetail, subNmId }) => {
        subExceptions.push({ label: subNmIdDetail, value: subNmId, displayText: subNmIdDetail });
    });
    return subExceptions;
}
export const getNigoExceptions = async ( categories: string[], accessToken: string | undefined) => {
    const response = await searchNigoExceptions(categories, accessToken);
    const nigoExceptions: NigoException[] = [];
    const nigoSubExceptions: NigoSubException[] = [];
    response?.map(({ detailedReason, nmId, exceptionSubRefs }) => {
        nigoExceptions.push({ label: detailedReason, value: nmId });

        nigoSubExceptions.push({ nmId,  subExceptions: exceptionSubRefs ? getSubExceptions(exceptionSubRefs) : [] });
    });

    return {nigoExceptions, nigoSubExceptions};
}