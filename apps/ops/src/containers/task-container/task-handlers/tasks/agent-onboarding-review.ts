import { NigoSearch } from '@deps/queries/api/nigo-search';

import { NigoExceptionResponse } from '../../components/steps/nigo-details/nigo-details.types';
import { TaskHandler } from '../types';

// Define expected payload and response types
interface AgentReviewPayload {
    category: string[];
    businessProcess: string;
}

const agentReviewHandler: TaskHandler<
    AgentReviewPayload,
    NigoExceptionResponse[]
> = {
    api: NigoSearch,

    getPayload: () => ({
        category: ['Agent Onboarding'],
        businessProcess: 'Agent Onboarding',
    }),

    transformResponse: (response, metadata) => {
        if (!response || response.length === 0) return;

        const reasonList = Array.from(new Set(response.map((item) => item)));

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.declineReasonEnum = {
                enum: reasonList,
            };
        }

        metadata[0].uiSchema.declineReason['ui:options'] = {
            enumNames: reasonList.map((reason) => reason.detailedReason),
        };
    },
};

export default agentReviewHandler;
