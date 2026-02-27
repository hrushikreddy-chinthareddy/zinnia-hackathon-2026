import { ProcessReferenceData } from '@deps/models/case/case';
import { FormMetadata } from '@deps/models/case/task';
import { BeneficiaryRecord } from '@deps/models/case/task/beneficiary-record';
import { TransactionData } from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';
import { searchTransactionsSSR } from '@deps/queries/api/transaction-search';

import { applyDocumentMatchingPotentialMatches } from '../../task.helpers';
import { TaskHandler } from '../types';
import { processReferenceDataAdapter } from './default-case-data-entry';

const DEFAULT_CASE_TYPE = 'Case Type Not Found';

export const DocumentMatchingHandler: TaskHandler<
    ManagementTask,
    {
        caseTypes: ProcessReferenceData[];
        potentialMatches: TransactionData[] | BeneficiaryRecord[] | null;
    }
> = {
    api: async (payload, accessToken, logCtx) => {
        const CASE_DATA_TYPE = 'PROCESS';
        const potentialMatchCriteria =
            payload?.data?.potentialMatchCriteria ?? {};
        const potentialMatches = await searchTransactionsSSR(
            potentialMatchCriteria,
            accessToken,
            logCtx
        );

        const caseTypes = await processReferenceDataAdapter(
            CASE_DATA_TYPE,
            accessToken,
            logCtx
        );

        return {
            caseTypes: caseTypes || [],
            potentialMatches: potentialMatches || [],
        };
    },
    getPayload: (task) => task,
    transformResponse: (response, metadata, task) => {
        const schema = metadata[0] as FormMetadata;

        applyDocumentMatchingPotentialMatches(
            response.potentialMatches as TransactionData[] | null | undefined,
            task,
            schema
        );

        if (schema.formSchema?.definitions) {
            schema.formSchema.definitions['caseTypeEnum'] = {
                enum: response.caseTypes?.map((item) => item.key).sort() || [
                    DEFAULT_CASE_TYPE,
                ],
            };
        }

        schema.uiSchema.caseType['ui:options'] = {
            enumNames: response.caseTypes?.map((item) => item.value).sort(),
        };
    },
};

export default DocumentMatchingHandler;
