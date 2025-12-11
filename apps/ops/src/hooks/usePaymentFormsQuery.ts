import { useQuery } from '@tanstack/react-query';

import { getPaymentForms } from '@deps/queries/api/aggregation';

interface UsePaymentFormsQueryProps {
    planCode?: string;
    policyNumber?: string;
    payeePartyId?: string;
    carrierId?: string;
    transactionName?: string;
}

export function usePaymentFormsQuery({
    planCode = '',
    policyNumber = '',
    payeePartyId = '',
    carrierId = 'WELB',
    transactionName = '',
}: UsePaymentFormsQueryProps) {
    return useQuery({
        queryKey: [
            'PaymentForms',
            planCode,
            policyNumber,
            payeePartyId,
            carrierId,
            transactionName,
        ],
        queryFn: () =>
            getPaymentForms({
                planCode,
                policyNumber,
                partyId: payeePartyId,
                carrier: carrierId,
                transactionName,
            }),
        placeholderData: (previousData) => previousData,
        select: (data) => ({ ...data }),
    });
}
