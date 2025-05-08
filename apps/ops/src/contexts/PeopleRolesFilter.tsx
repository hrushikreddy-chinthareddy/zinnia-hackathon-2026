import { createContext, useEffect, useMemo, useState } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import { storage } from '@deps/helpers/sessionStorage.helpers';

export interface PeopleRolesFilter {
    filterValue: string;
    filterTagList: string[];
}

export const initialFilter: PeopleRolesFilter = {
    filterValue: 'All',
    filterTagList: ['All'],
};

interface PeopleRolesFilterContextProps {
    peopleRolesFilter: PeopleRolesFilter;
    setPeopleRolesFilter: (filters: PeopleRolesFilter) => void;
    clearPeopleRolesFilter: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const PeopleRolesFilterContext = createContext<PeopleRolesFilterContextProps>({
    peopleRolesFilter: initialFilter,
    setPeopleRolesFilter: noop,
    clearPeopleRolesFilter: noop,
});

export const PeopleRolesFilterProvider = ({ children }: any) => {
    const [peopleRolesFilter, setPeopleRolesFilter] = useState(initialFilter);
    const [isLoading, setIsLoading] = useState(true);

    const clearFilters = () => {
        storage.removeItem('PEOPLE_ROLES_FILTER');
    };

    useEffect(() => {
        const filtersFromStorage = storage.getItem('PEOPLE_ROLES_FILTER') as PeopleRolesFilter;

        if (filtersFromStorage) {
            setPeopleRolesFilter(filtersFromStorage);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        return clearFilters;
    }, []);

    useEffect(() => {
        storage.setItem('PEOPLE_ROLES_FILTER', peopleRolesFilter);
    }, [peopleRolesFilter]);

    const memoizedValues = useMemo(
        () => ({ peopleRolesFilter, setPeopleRolesFilter, clearPeopleRolesFilter: clearFilters }),
        [peopleRolesFilter]
    );

    if (isLoading) {
        return <PageLoader />;
    }

    return <PeopleRolesFilterContext.Provider value={memoizedValues}>{children}</PeopleRolesFilterContext.Provider>;
};
