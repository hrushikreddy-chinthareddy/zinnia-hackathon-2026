import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';

import {
    searchTransactionsByPaymentRecordId,
    SearchTransactionFilters,
} from '../../../../queries/api/transaction-search';
import { TaskHandler } from '../types';

interface CostBasisReviewPayload {
    paymentRecordId: string;
}

const costBasisReviewHandler: TaskHandler<CostBasisReviewPayload, any> = {
    api: async (payload: CostBasisReviewPayload) => {
        if (!payload.paymentRecordId) {
            return null;
        }

        const filters: SearchTransactionFilters = {
            paymentRecordId: payload.paymentRecordId,
        };
        const response = await searchTransactionsByPaymentRecordId(filters);

        if (!response || !Array.isArray(response) || response.length === 0) {
            console.error('costBasisReviewHandler::api::invalidResponse', {
                response,
                paymentRecordId: payload.paymentRecordId,
            });
            return null;
        }

        return response[0].entity;
    },

    getPayload: (taskData: any) => ({
        paymentRecordId:
            taskData?.data?.details?.paymentRecord?.paymentRecordId || '',
    }),

    transformResponse: (
        response,
        metadata: FormMetadata[],
        task?: ManagementTask
    ) => {
        if (!response || !metadata[0]?.uiSchema?.details?.paymentRecord) {
            return;
        }
        if (task) {
            Object.assign(task, {
                data: {
                    ...task.data,
                    details: {
                        ...task.data?.details,
                        paymentRecord: response,
                    },
                },
            });
        }

        metadata[0].uiSchema.details.paymentRecord['ui:options'] = {
            cardType: 'Detailed',
            icon: 'BANK',
            label: true,
            ObjectFieldTemplate: 'CardTemplate',
            sectionTitle: 'Details',
            nobackground: true,
        };
    },
};

export default costBasisReviewHandler;
