import { searchTransactionsByPaymentRecordId, SearchTransactionFilters } from '../../../../queries/api/transaction-search';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { TaskHandler } from '../types';

interface PaymentFollowUpPayload {
    paymentRecordId: string;
}

const PaymentFollowUpHandler: TaskHandler<PaymentFollowUpPayload, any> = {
    api: async (payload: PaymentFollowUpPayload) => {
        if (!payload.paymentRecordId) {
            console.error('PaymentFollowUpHandler::api::missingPaymentRecordId', { payload });
            return null;
        }

        const filters: SearchTransactionFilters = { paymentRecordId: payload.paymentRecordId };
        const response = await searchTransactionsByPaymentRecordId(filters);

        if (!response || !Array.isArray(response) || response.length === 0) {
            console.error('PaymentFollowUpHandler::api::invalidResponse', {
                response,
                paymentRecordId: payload.paymentRecordId,
            });
            return null;
        }

        return response[0].entity;
    },

    getPayload: (taskData: any) => ({
        paymentRecordId: taskData?.data?.details?.paymentRecord?.paymentRecordId || '',
    }),

    transformResponse: (response, metadata: any[]) => {
        if (!response || !metadata[0]?.uiSchema?.details?.paymentRecord) {
            return;
        }

        if (metadata[0]?.formSchema) {
            metadata[0].formSchema = replacePlaceholders(metadata[0].formSchema, response);
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
