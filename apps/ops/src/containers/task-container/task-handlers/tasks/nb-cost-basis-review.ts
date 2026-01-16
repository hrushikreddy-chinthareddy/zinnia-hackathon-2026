import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { searchTransactionsSSR } from '@deps/queries/api/transaction-search';
import { LoggingContext, logWarn } from '@deps/utils/server-logging';

import { TaskHandler, TransactionSearchIdentifiers } from '../types';

interface CostBasisReviewPayload {
    paymentRecordId: string;
}

export const buildPaymentRecordIdRequest = (paymentRecordId: string) => {
    return {
        identifiers: [
            {
                identifier: TransactionSearchIdentifiers.PAYMENT_RECORD_ID,
                value: paymentRecordId,
            },
        ],
    };
};

const costBasisReviewHandler: TaskHandler<CostBasisReviewPayload, any> = {
    api: async (
        payload: CostBasisReviewPayload,
        accessToken: string,
        loggingContext: LoggingContext
    ) => {
        if (!payload.paymentRecordId) {
            return null;
        }

        const filters = buildPaymentRecordIdRequest(payload.paymentRecordId);

        const response = await searchTransactionsSSR(
            filters,
            accessToken,
            loggingContext
        );

        if (!response || !Array.isArray(response) || response.length === 0) {
            logWarn('costBasisReviewHandler::api::invalidResponse', {
                ...loggingContext,
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
