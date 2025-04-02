import { NigoSearch } from '@deps/queries/api/nigo-search';

import { TaskHandler } from '../types';

// Define expected payload and response types
interface PaymentReviewPayload {
    category: string[];
    businessProcess: string;
}

interface NigoExceptionResponse {
    reason: string;
    nmId: string;
}

const paymentReviewHandler: TaskHandler<PaymentReviewPayload, NigoExceptionResponse[]> = {
    api: NigoSearch,

    getPayload: () => ({
        category: ['Agent'],
        businessProcess: 'New Business',
    }),

    transformResponse: (response, metadata) => {
        if (!response || response.length === 0) return;

        const reasonList = Array.from(new Set(response.map(item => item)));

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.declineReason = { enum: reasonList.map(reason => reason.nmId) };
        }

        metadata[0].uiSchema.declineReason['ui:options'].enumOptions = reasonList.map(reason => ({
            label: reason.reason,
            value: reason.nmId,
        }));
    },
};

export default paymentReviewHandler;
