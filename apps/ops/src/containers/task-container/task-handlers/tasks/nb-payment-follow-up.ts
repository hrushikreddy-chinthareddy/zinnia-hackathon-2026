import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { searchTransactionsSSR } from '@deps/queries/api/transaction-search';
import { LoggingContext, logWarn } from '@deps/utils/server-logging';

import { TaskHandler } from '../types';
import { buildPaymentRecordIdRequest } from './nb-cost-basis-review';

interface PaymentFollowUpPayload {
    paymentRecordId: string;
}

const PaymentFollowUpHandler: TaskHandler<PaymentFollowUpPayload, any> = {
    api: async (
        payload: PaymentFollowUpPayload,
        accessToken: string,
        loggingContext: LoggingContext
    ) => {
        if (!payload.paymentRecordId) {
            logWarn('PaymentFollowUpHandler::api::missingPaymentRecordId', {
                ...loggingContext,
                payload,
            });
            return null;
        }

        const filters = buildPaymentRecordIdRequest(payload.paymentRecordId);
        const response = await searchTransactionsSSR(
            filters,
            accessToken,
            loggingContext
        );

        if (!response || !Array.isArray(response) || response.length === 0) {
            logWarn('PaymentFollowUpHandler::api::invalidResponse', {
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

    transformResponse: (response, metadata, task) => {
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

        if (metadata[0]?.formSchema) {
            metadata[0].formSchema = replacePlaceholders(
                metadata[0].formSchema,
                response
            );
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

export default PaymentFollowUpHandler;
