import { NigoSearch } from '@deps/queries/api/nigo-search';

import { TaskHandler } from '../types';

// Define expected payload and response types
interface BackgroundReviewPayload {
    category: string[];
    businessProcess: string;
}

interface NigoExceptionResponse {
    reason: string;
    category: string;
    detailedReason: string;
    nmId: string;
}

const backgroundReviewHandler: TaskHandler<BackgroundReviewPayload, NigoExceptionResponse[]> = {
    api: NigoSearch,

    getPayload: () => ({
        category: ['Agent onboarding'],
        businessProcess: 'Agent Onboarding',
    }),

    transformResponse: (response, metadata) => {
        if (!response || response.length === 0) return;

        const reason = 'Background Check';

        const reasonList = Array.from(new Set(response.filter(item => item.reason === reason)));

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.declineReason = { enum: reasonList.map(reason => JSON.stringify(reason)) };
        }

        metadata[0].uiSchema.declineReason['ui:options'].enumOptions = reasonList.map(reason => ({
            label: reason.detailedReason,
            value: JSON.stringify(reason),
        }));
    },
};

export default backgroundReviewHandler;
