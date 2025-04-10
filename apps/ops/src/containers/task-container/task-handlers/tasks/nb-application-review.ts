import { NigoSearch } from '@deps/queries/api/nigo-search';
import { NigoExceptionResponse } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';

import { TaskHandler, ReviewPayload } from '../types';

const applicationReviewHandler: TaskHandler<ReviewPayload, NigoExceptionResponse[]> = {
    api: NigoSearch,

    getPayload: () => ({
        category: ['Application'],
        businessProcess: 'New Business',
    }),

    transformResponse: (response, metadata) => {
        if (!response || response.length === 0) return;

        const reasonList = Array.from(new Set(response.map(item => item)));

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.declineReason = { enum: reasonList.map(reason => JSON.stringify(reason)) };
        }

        metadata[0].uiSchema.declineReason['ui:options'].enumOptions = reasonList.map(reason => ({
            label: reason.detailedReason,
            value: JSON.stringify(reason),
        }));
    },
};

export default applicationReviewHandler;
