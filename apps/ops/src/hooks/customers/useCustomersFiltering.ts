import { useMemo, useState } from 'react';

import { ContactFilterRequest } from '@zinnia/api-types/types/contact-management';

export interface CustomersFilteringState {
    limit: number;
    page: number;
    sortBy?: ContactFilterRequest['sortBy'];
    sortOrder?: ContactFilterRequest['sortOrder'];
    filters?: ContactFilterRequest['filters'];
    offset: number;
    setPage: (page: number) => void;
}

export const useCustomersFiltering = (): CustomersFilteringState => {
    const limit = 10;
    const [page, setPage] = useState(0);

    const [sortBy] = useState<ContactFilterRequest['sortBy']>();
    const [sortOrder] = useState<ContactFilterRequest['sortOrder']>();
    const [filters] = useState<ContactFilterRequest['filters']>();

    const offset = useMemo(() => page * limit, [page, limit]);

    return {
        limit,
        page,
        sortBy,
        sortOrder,
        filters,
        offset,
        setPage,
    };
};
