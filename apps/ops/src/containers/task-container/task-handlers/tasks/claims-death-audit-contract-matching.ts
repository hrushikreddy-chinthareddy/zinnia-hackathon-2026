import { getName } from '@deps/helpers/party-info-helpers';
import { ProcessReferenceData } from '@deps/models/case/case';
import { FormMetadata } from '@deps/models/case/task';

import { TaskHandler } from '../types';

export const DeathAuditContractMatchingHandler: TaskHandler<
    Record<string, never>,
    ProcessReferenceData[]
> = {
    api: async () => {
        return [];
    },
    getPayload: () => ({}),
    transformResponse: (response, metadata, task) => {
        const schema = metadata[0] as FormMetadata;
        if (!schema?.formSchema?.definitions) return;

        if (task) {
            const fileRowData =
                task?.data?.details?.auditQualCaseMatch?.fileRowData;
            const fullName = getName({
                firstName: fileRowData?.clientFirst,
                lastName: fileRowData?.clientLast,
            });
            schema.formSchema.definitions.clientFullName = {
                const: fullName,
            };
        }
    },
};

export default DeathAuditContractMatchingHandler;
