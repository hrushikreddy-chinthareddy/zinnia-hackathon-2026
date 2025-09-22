import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { CaseIdentifier } from '@deps/models/case/case';

import { TaskHandler } from '../types';

const claimsBeneReviewHandler: TaskHandler<any, any> = {
    api: async () => {
        return [];
    },
    getPayload: () => ({}),

    transformResponse: (__response, metadata, task) => {
        const formSchema = metadata[0].formSchema || {};
        const contractNumber =
            getCaseIdentifierValue(
                task?.identifiers || [],
                CaseIdentifier.contractNumber
            ) || '';
        const data = { contractNumber: contractNumber };

        const updatedFormSchema = replacePlaceholders(formSchema, data, true);
        metadata[0].formSchema = updatedFormSchema;
        return metadata;
    },
};

export default claimsBeneReviewHandler;
