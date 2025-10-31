import { QueryClient, useQuery } from '@tanstack/react-query';
import { Policy } from '@xd/api-types/dist/generated-types/sor';
import dayjs from 'dayjs';

import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import {
    getPolicyQuery,
    getPolicyQueryKey,
} from '@deps/queries/tanstack/policyQueries/policyQueries';

export const usePolicyQuery = (
    planCode: string = '',
    policyNumber: string = '',
    date: string,
    queryClient: QueryClient,
    enableQuery: boolean
) => {
    return useQuery({
        queryKey: [getPolicyQueryKey, policyNumber, planCode, date],
        queryFn: () =>
            getPolicyQuery(
                policyNumber as string,
                planCode as string,
                dayjs(date, DATE_PICKER_FORMAT).format('YYYY-MM-DD')
            ),
        placeholderData: () => {
            const initialData = queryClient.getQueryData<Policy>([
                getPolicyQueryKey,
                policyNumber,
                planCode,
            ]);
            return initialData;
        },
        enabled: enableQuery,
    });
};
