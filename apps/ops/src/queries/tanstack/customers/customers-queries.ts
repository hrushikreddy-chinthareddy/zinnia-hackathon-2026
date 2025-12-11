import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getContactsQuery } from '@deps/queries/tanstack/contactManagementQueries/contact-management-queries';
import {
    ContactFilterRequest,
    ContactSearchResult,
} from '@zinnia/api-types/types/contact-management';

export interface UseCustomersQueryParams {
    limit: number;
    offset: number;
    sortBy?: ContactFilterRequest['sortBy'];
    sortOrder?: ContactFilterRequest['sortOrder'];
    filters?: ContactFilterRequest['filters'];
}

export const useCustomersQuery = ({
    limit,
    offset,
    sortBy,
    sortOrder,
    filters,
}: UseCustomersQueryParams) => {
    const queryClient = useQueryClient();

    return useQuery<ContactSearchResult>({
        queryKey: ['contacts', filters, sortBy, sortOrder, limit, offset],
        queryFn: () =>
            getContactsQuery({
                limit,
                offset,
                sortBy,
                sortOrder,
                filters,
            }),
        placeholderData: () => {
            return queryClient
                .getQueryData<ContactSearchResult[]>(['contacts', filters])
                ?.find(Boolean);
        },
    });
};
