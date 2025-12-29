import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { searchIllustrationsClientCases } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import {
    ClientCaseSearchInputs,
    IllustraionsClientCaseSearchResponse,
} from '@deps/types/illustrations';

export type IllustrationsClientCaseContextValue = {
    filters: ClientCaseSearchInputs;
    setFilters: (filters: ClientCaseSearchInputs) => void;
    results: IllustraionsClientCaseSearchResponse;
    isError?: Error | null;
    isLoading?: boolean;
    defaultFilters: ClientCaseSearchInputs;
    defaultLimit: number;
};

export const IllustrationsClientCaseContext = createContext<
    IllustrationsClientCaseContextValue | undefined
>(undefined);

const DEFAULT_LIMIT = 10;
const defaultFilters: ClientCaseSearchInputs = {
    title: '',
    agentFirstName: '',
    agentLastName: '',
    insuredFirstName: '',
    insuredLastName: '',
    limit: DEFAULT_LIMIT,
    offset: 0,
    sortBy: 'lastModified',
    sortDir: 'descending',
};

export function IllustrationsClientCaseProvider({
    children,
}: PropsWithChildren<object>) {
    // const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams());
    const searchParams = useSearchParams();
    const router = useRouter();

    const parseFilters = useMemo(() => {
        const offset = Number(searchParams.get('offset'));
        const safeOffset = Number.isFinite(offset) && offset > 0 ? offset : 0;
        const limit = Number(searchParams.get('limit'));
        const safeLimit =
            Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT;

        return {
            title: searchParams.get('title') || '',
            agentFirstName: searchParams.get('agentFirstName') || '',
            agentLastName: searchParams.get('agentLastName') || '',
            insuredFirstName: searchParams.get('insuredFirstName') || '',
            insuredLastName: searchParams.get('insuredLastName') || '',
            limit: safeLimit,
            offset: safeOffset,
            sortBy: searchParams.get('sortBy') || 'lastModified',
            sortDir: searchParams.get('sortDir') || 'descending',
        };
    }, [searchParams]);

    const [filters, setFiltersState] =
        useState<ClientCaseSearchInputs>(parseFilters);

    const removeEmptyFilters = (fullFilters: ClientCaseSearchInputs) =>
        Object.fromEntries(
            Object.entries(fullFilters).filter(
                ([_, value]) =>
                    value !== '' && value !== undefined && value !== null
            )
        );
    const setFilters = (newFilter: ClientCaseSearchInputs) => {
        let newFilters = removeEmptyFilters(newFilter);

        if (
            Object.hasOwn(newFilters, 'sortBy') &&
            Object.hasOwn(newFilters, 'sortDir')
        ) {
            const { offset, limit, ...currentFiltersClear } =
                removeEmptyFilters(parseFilters);
            newFilters = { ...currentFiltersClear, ...newFilters };
        }

        const params = new URLSearchParams(newFilters);
        router.push(`?${params.toString()}`);
    };

    useEffect(() => {
        setFiltersState(parseFilters);
    }, [parseFilters]);

    const {
        data: results = {
            results: [],
            limit: DEFAULT_LIMIT,
            offset: 0,
            total: 0,
            count: 0,
        },
        isFetching: clientCaseDataFetching,
        error: clientCaseDataError,
    } = useQuery({
        queryKey: ['clientCaseSearch', parseFilters],
        placeholderData: (previousData) => previousData,
        queryFn: () => {
            return searchIllustrationsClientCases(parseFilters);
        },
        // enabled: true,
    });

    return (
        <IllustrationsClientCaseContext.Provider
            value={{
                filters,
                setFilters,
                results,
                isError: clientCaseDataError,
                isLoading: clientCaseDataFetching,
                defaultFilters,
                defaultLimit: DEFAULT_LIMIT,
            }}
        >
            {children}
        </IllustrationsClientCaseContext.Provider>
    );
}

// Hook to consume the context safely
export function useIllustrationsClientCase(): IllustrationsClientCaseContextValue {
    const context = useContext(IllustrationsClientCaseContext);

    if (!context) {
        throw new Error(
            'useIllustrationsClientCase must be used within an IllustrationsClientCaseProvider'
        );
    }

    return context;
}
