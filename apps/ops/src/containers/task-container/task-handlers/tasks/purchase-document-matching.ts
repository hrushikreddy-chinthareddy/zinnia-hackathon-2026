import { getReferenceDataSSR } from '@deps/queries/api/cases';

import { TaskHandler } from '../types';
interface PurchaseDocumentMatchingPayload {
    carrier: string[];
    keys: ('processList' | 'requestSubType' | 'productName')[];
}

const DocumentMatchingHandler: TaskHandler<PurchaseDocumentMatchingPayload, any> = {
    api: getReferenceDataSSR,
    getPayload: (task: any) => ({
        carrier: [task?.carrier],
        keys: ['processList'],
    }),

    transformResponse: (response, metadata) => {
        if (!response || response.length === 0) return;

        const caseTypeOptions = response;

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.caseTypeEnum = {
                enum: caseTypeOptions?.referenceData.processList || ['Case Type Not Found'],
            };
        }
    },
};

export default DocumentMatchingHandler;
