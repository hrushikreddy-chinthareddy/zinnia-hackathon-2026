import { NigoSearch } from '@deps/queries/api/nigo-search';

import { NigoExceptionResponse } from '../../components/steps/nigo-details/nigo-details.types';
import { TaskHandler } from '../types';

// Define expected payload and response types
interface BackgroundReviewPayload {
    category: string[];
    businessProcess: string;
}

const backgroundReviewHandler: TaskHandler<
    BackgroundReviewPayload,
    NigoExceptionResponse[]
> = {
    api: NigoSearch,

    getPayload: () => ({
        category: ['Agent onboarding'],
        businessProcess: 'Agent Onboarding',
    }),

    transformResponse: (response, metadata) => {
        if (!response || response.length === 0) return;

        const reason = 'Background Check';

        const reasonList = Array.from(
            new Set(response.filter((item) => item.reason === reason))
        );

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.declineReason = {
                enum: reasonList,
            };
        }

        metadata[0].uiSchema.declineReason['ui:options'] = {
            enumNames: reasonList.map((reason) => reason.detailedReason),
        };
    },
};

export default backgroundReviewHandler;
