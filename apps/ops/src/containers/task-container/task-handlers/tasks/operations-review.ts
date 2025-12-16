import { ProcessReferenceData } from '@deps/models/case/case';
import { FormMetadata } from '@deps/models/case/task';
import { getProcessReferenceDataSSR } from '@deps/queries/api/cases';
import { LoggingContext } from '@deps/utils/server-logging';

import { TaskHandler } from '../types';

const DEFAULT_CASE_TYPE = 'SERVICE REQUEST';

export const processReferenceDataAdapter = async (
    caseDataType: string,
    accessToken: string,
    logCtx: LoggingContext
): Promise<ProcessReferenceData[] | null> => {
    const response = await getProcessReferenceDataSSR(
        caseDataType,
        '',
        accessToken,
        logCtx
    );

    return response;
};

const OperationsReviewHandler: TaskHandler<
    Record<string, never>,
    ProcessReferenceData[]
> = {
    api: (payload, accessToken, logCtx) => {
        const CASE_DATA_TYPE = 'PROCESS_SUB_TYPE/tree';
        return processReferenceDataAdapter(CASE_DATA_TYPE, accessToken, logCtx);
    },
    getPayload: () => ({}),
    transformResponse: (response, metadata, task?: any) => {
        if (!response?.length) return;

        const PROCESS_KEY = 'SERVICE REQUEST';
        const schema = metadata[0] as FormMetadata;
        if (!schema?.formSchema?.definitions) return;

        if (task) {
            Object.assign(task, {
                ...task,
                caseDetails: {
                    ...task?.caseDetails,
                    caseType: DEFAULT_CASE_TYPE,
                },
            });
        }

        metadata[0].uiSchema.caseDetails.caseSubType['ui:options'].enumOptions =
            response
                .filter((reason) => reason.parentKey === PROCESS_KEY)
                .map((reason) => {
                    return {
                        label: reason.value,
                        value: reason.key,
                        description: reason.child?.[0]?.value || '',
                    };
                })
                .sort((a, b) => a.label.localeCompare(b.label));
    },
};

export default OperationsReviewHandler;
