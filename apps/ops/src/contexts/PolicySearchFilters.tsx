import { useRouter } from 'next/router';
import { createContext, useEffect, useMemo, useState } from 'react';

import { SearchBarInitialValues } from '@deps/components/search/search-bar';
import { storage } from '@deps/helpers/sessionStorage.helpers';
import { POLICY_SEARCH_FILTERS_STORAGE_KEY, isResetQueryParam } from '@deps/types/constants';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
export interface PolicySearchFilters {
    searchValue: SearchViewQuery;
    limit: number;
    offset: number;
    toggleValue: PolicySearchKeys;
}
export const initialFilters: PolicySearchFilters = {
    searchValue: SearchBarInitialValues,
    limit: 5,
    offset: 0,
    toggleValue: 'policyNumber',
};

interface PolicySearchFiltersProps {
    policySearchFilters: PolicySearchFilters;
    setPolicySearchFilters: (filters: PolicySearchFilters) => void;
    clearPolicySearchFilters: () => void;
    setShowFieldErrorMessage: (v: boolean) => void;
    showFieldErrorMessage: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const PolicySearchFiltersContext = createContext<PolicySearchFiltersProps>({
    policySearchFilters: initialFilters,
    setPolicySearchFilters: noop,
    clearPolicySearchFilters: noop,
    setShowFieldErrorMessage: noop,
    showFieldErrorMessage: false,
});

export const PolicySearchFiltersProvider = ({ children }: any) => {
    const [policySearchFilters, setPolicySearchFilters] = useState(initialFilters);
    const [showFieldErrorMessage, setShowFieldErrorMessage] = useState(false);
    const router = useRouter();

    const clearFilters = () => {
        setShowFieldErrorMessage(false);
        setPolicySearchFilters({ ...initialFilters });
    };

    useEffect(() => {
        const filtersFromStorage = storage.getItem(POLICY_SEARCH_FILTERS_STORAGE_KEY) as PolicySearchFilters;

        if (filtersFromStorage) {
            setPolicySearchFilters(filtersFromStorage);
        }

        const handleRouteChangeComplete = (url: string) => {
            if (url.indexOf(isResetQueryParam) !== -1) {
                clearFilters();
            }
        };

        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, [router.events]);

    useEffect(() => {
        // Set session storage filters on changes
        storage.setItem(POLICY_SEARCH_FILTERS_STORAGE_KEY, policySearchFilters);
    }, [policySearchFilters]);

    const memoizedValues = useMemo(
        () => ({
            policySearchFilters,
            setPolicySearchFilters,
            clearPolicySearchFilters: clearFilters,
            showFieldErrorMessage,
            setShowFieldErrorMessage,
        }),
        [policySearchFilters, showFieldErrorMessage, setShowFieldErrorMessage]
    );

    return <PolicySearchFiltersContext.Provider value={memoizedValues}>{children}</PolicySearchFiltersContext.Provider>;
};
