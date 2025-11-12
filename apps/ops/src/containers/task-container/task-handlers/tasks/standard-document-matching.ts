import { ProcessReferenceData } from '@deps/models/case/case';
import { FormMetadata } from '@deps/models/case/task';

import { TaskHandler } from '../types';
import { processReferenceDataAdapter } from './default-case-data-entry';

const DEFAULT_CASE_TYPE = 'Case Type Not Found';

export const DocumentMatchingHandler: TaskHandler<
    Record<string, never>,
    ProcessReferenceData[]
> = {
    api: (_payload, accessToken, logCtx) => {
        const CASE_DATA_TYPE = 'PROCESS';
        return processReferenceDataAdapter(CASE_DATA_TYPE, accessToken, logCtx);
    },
    getPayload: () => ({}),
    transformResponse: (response, metadata) => {
        if (!response?.length) return;

        const schema = metadata[0] as FormMetadata;
        if (!schema?.formSchema?.definitions) return;

        schema.formSchema.definitions.caseTypeEnum = {
            enum: response.map((item) => item.key).sort() || [
                DEFAULT_CASE_TYPE,
            ],
        };

        schema.uiSchema.caseType['ui:options'] = {
            enumNames: response.map((item) => item.value).sort(),
        };
    },
};

export default DocumentMatchingHandler;
