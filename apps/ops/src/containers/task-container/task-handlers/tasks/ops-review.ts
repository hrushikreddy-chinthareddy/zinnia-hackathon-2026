import { NigoExceptionResponse } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';
import { NigoSearch } from '@deps/queries/api/nigo-search';

import { TaskHandler, ReviewPayload } from '../types';

// Define expected payload and response types

const opsReviewHandler: TaskHandler<ReviewPayload, NigoExceptionResponse[]> = {
    api: NigoSearch,

    getPayload: () => ({
        category: [
            'Client Information',
            'Beneficiary Info',
            'Ops Review Signature',
            'Banking Details',
            'Form Submission',
            'Authorization Docs',
            'Approval',
            'Agent Details',
        ],
        businessProcess: 'Opearation review',
    }),

    transformResponse: (response, metadata) => {
        if (!response || response.length === 0) return;

        const reasonList = Array.from(new Set(response.map(item => item)));

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.declineReasonEnum = { enum: reasonList.map(reason => JSON.stringify(reason)) };
        }

        metadata[0].uiSchema.declineReason['ui:options'] = { enumNames: reasonList.map(reason => reason.detailedReason) };
    },
};

export default opsReviewHandler;
