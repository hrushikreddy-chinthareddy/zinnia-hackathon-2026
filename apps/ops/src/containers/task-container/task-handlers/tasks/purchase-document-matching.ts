import { FormMetadata } from '@deps/models/case/task';
import { TransactionData } from '@deps/models/case/task/doc-matching-payment';
import { getReferenceDataSSR } from '@deps/queries/api/cases';
import {
    SearchTransactionPayload,
    searchTransactionsSSR,
} from '@deps/queries/api/transaction-search';
import { LoggingContext } from '@deps/utils/server-logging';

import { applyDocumentMatchingPotentialMatches } from '../../task.helpers';
import { TaskHandler } from '../types';

interface PurchaseDocumentMatchingPayload {
    carrier: string[];
    keys: ('processList' | 'requestSubType' | 'productName')[];
    potentialMatchesCriteria: SearchTransactionPayload;
}

const DocumentMatchingHandler: TaskHandler<
    PurchaseDocumentMatchingPayload,
    any
> = {
    api: async (
        payload: PurchaseDocumentMatchingPayload,
        accessToken: string,
        logCtx: LoggingContext
    ) => {
        const potentialMatches = await searchTransactionsSSR(
            payload?.potentialMatchesCriteria,
            accessToken,
            logCtx
        );
        const caseTypes = await getReferenceDataSSR(
            { carrier: payload.carrier, keys: ['processList'] },
            accessToken,
            logCtx
        );
        return {
            caseTypes: caseTypes || [],
            potentialMatches: potentialMatches || [],
        };
    },
    getPayload: (task: any) => ({
        carrier: [task?.carrier],
        keys: ['processList'],
        potentialMatchesCriteria: task?.data?.potentialMatchCriteria,
    }),

    transformResponse: (response, metadata, task) => {
        const caseTypeOptions = response?.caseTypes;
        const schema = metadata[0] as FormMetadata;

        applyDocumentMatchingPotentialMatches(
            response.potentialMatches as TransactionData[] | null,
            task,
            schema
        );

        if (schema?.formSchema?.definitions) {
            schema.formSchema.definitions.caseTypeEnum = {
                enum: caseTypeOptions?.referenceData.processList || [
                    'Case Type Not Found',
                ],
            };
        }
    },
};

export default DocumentMatchingHandler;
