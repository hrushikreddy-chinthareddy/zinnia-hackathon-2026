import { NigoSearch } from '@deps/queries/api/nigo-search';

import { TaskHandler } from '../types';

// Define expected payload and response types
interface AgentReviewPayload {
    category: string[];
    businessProcess: string;
}

interface NigoExceptionResponse {
    reason: string;
}

const agentReviewHandler: TaskHandler<AgentReviewPayload, NigoExceptionResponse[]> = {
    api: NigoSearch,

    getPayload: () => ({
        category: ['Agent Onboarding'],
        businessProcess: 'Agent Onboarding',
    }),

    transformResponse: (response, metadata) => {
        if (!response || response.length === 0) return;

        const reasonList = Array.from(new Set(response.map(item => item.reason)));

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.declineReason = { enum: reasonList };
        }

        metadata[0].uiSchema.declineReason['ui:options'].enumOptions = reasonList.map(reason => ({
            label: reason,
            value: reason,
        }));
    },
};

export default agentReviewHandler;