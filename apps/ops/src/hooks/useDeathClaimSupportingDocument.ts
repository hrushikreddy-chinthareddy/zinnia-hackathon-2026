import { useCallback, useEffect, useState } from 'react';

import { getDocuments } from '@deps/queries/api/integration';

export enum QueueNames {
    CPNEW = 'CP - NEW',
    CPASSIGN = 'CP - ASSIGN',
    CPRETURNING = 'CP - RETURNING',
    CASECREATION = 'CASE CREATION',
}

const applicableQueueNames: QueueNames[] = [
    QueueNames.CPNEW,
    QueueNames.CPASSIGN,
    QueueNames.CPRETURNING,
    QueueNames.CASECREATION,
];

export const useDeathClaimSupportingDocument = (
    lob: string,
    policyNumber: string
) => {
    const [isLoading, setIsLoading] = useState(false);
    const [supportingDocuments, setSupportingDocuments] = useState<any[]>([]);

    const getSupportingDocuments = useCallback(async () => {
        try {
            setIsLoading(true);
            setSupportingDocuments([]);
            const documents = await getDocuments(
                lob,
                'Initial Death Notify',
                policyNumber
            );
            const documentList =
                documents?.filter((document: any) => {
                    return applicableQueueNames.includes(
                        document.queueName as QueueNames
                    );
                }) || [];
            setSupportingDocuments(documentList);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
        }
    }, [lob, policyNumber]);

    useEffect(() => {
        getSupportingDocuments();
    }, [getSupportingDocuments]);

    return { supportingDocuments, isLoading };
};
