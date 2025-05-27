import { ProcessReferenceData } from '@deps/models/case/case';
import { FormMetadata } from '@deps/models/case/task';
import { getProcessReferenceDataSSR } from '@deps/queries/api/cases';
import { LoggingContext } from '@deps/utils/server-logging';

import { TaskHandler } from '../types';

const DEFAULT_CASE_TYPE = 'Case Type Not Found';

export const processReferenceDataAdapter = async (
    _payload: Record<string, never>,
    accessToken: string,
    logCtx: LoggingContext
): Promise<ProcessReferenceData[] | null> => {
    const PROCESS_KEY = 'PROCESS';
    const response = await getProcessReferenceDataSSR(PROCESS_KEY, '', accessToken, logCtx);

    if (!response) return null;

    return response?.map(process => ({
        type: process.type,
        key: process.key,
        value: process.value,
    }));
};

const DefaultCaseDataEntryHandler: TaskHandler<Record<string, never>, ProcessReferenceData[]> = {
    api: processReferenceDataAdapter,
    getPayload: () => ({}),
    transformResponse: (response, metadata) => {
        if (!response?.length) return;

        const schema = metadata[0] as FormMetadata;
        if (!schema?.formSchema?.definitions) return;

        schema.formSchema.definitions.caseTypeEnum = {
            enum: response.map(item => item.key) || [DEFAULT_CASE_TYPE],
        };

        schema.uiSchema.caseDetails.caseType['ui:options'] = { enumNames: response.map(item => item.value) };
    },
};

export default DefaultCaseDataEntryHandler;
