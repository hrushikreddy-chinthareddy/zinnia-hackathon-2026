import { useCallback, useEffect, useState } from 'react';

import { getDocuments } from '@deps/queries/api/integration';
import { browserLogInfo } from '@deps/utils/browser-logging';

export enum QueueNames {
    CPNEW = 'CP - NEW',
    CPASSIGNED = 'CP - ASSIGNED',
    CPRETURNING = 'CP - RETURNING',
    CASECREATION = 'CASE CREATION',
}

const applicableQueueNames: QueueNames[] = [
    QueueNames.CPNEW,
    QueueNames.CPASSIGNED,
    QueueNames.CPRETURNING,
    QueueNames.CASECREATION,
];

export interface DocumentInfo {
    lob: string;
    contract: string;
    documentNumber: string;
    system: string;
    productLine: string;
    productName: string;
    productCompanyCode: string;
    caseId: string;
    queueName: string;
    transactionType: string;
    sysDocumentHandle: string;
}

export const useDeathClaimSupportingDocument = (
    lob: string,
    policyNumber: string
) => {
    const [isLoading, setIsLoading] = useState(true);
    const [supportingDocuments, setSupportingDocuments] = useState<
        DocumentInfo[]
    >([]);

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
            browserLogInfo('getSupportingDocuments::success', {
                lob,
                policyNumber,
                documentListCount: documentList.length,
                function: 'integration.getDocuments',
            });
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
