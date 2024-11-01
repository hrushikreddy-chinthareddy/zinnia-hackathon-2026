import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { useQueryStore } from './queryStore';
import { ParsedUrlQueryInput } from 'querystring';
import xss from 'xss';

/**
 * Provides an interface to read and write query string filters.
 *
 * @param queryKeys - An array of query string keys that are considered filters.
 * @returns An array containing:
 *  - `filters` - A map of query string key to value, where the values are parsed JSON objects.
 *  - `setFilters` - A function that sets new filter values, merging them with existing non-filter query string values.
 */
export const useQueryFilters = (queryKeys: string[]) => {
    const [queryParams, setQueryParams] = useQueryStore();

    const filters = useMemo(() => {
        return Object.keys(queryParams).reduce((acc, qpKey) => {
            if (queryKeys.includes(qpKey)) {
                try {
                    acc[qpKey] = JSON.parse(xss(JSON.stringify(queryParams[qpKey as keyof typeof queryParams])));
                } catch (error) {
                    console.error('queryStoreFilters::Error parsing query param', error);
                }
            }
            return acc;
        }, {} as ParsedUrlQueryInput);
    }, [queryParams]);

    const setFilters: Dispatch<SetStateAction<ParsedUrlQueryInput>> = useCallback(
        (newFilters: SetStateAction<ParsedUrlQueryInput>) => {
            let filtersToInsert: ParsedUrlQueryInput = {};
            if (typeof newFilters === 'function') {
                filtersToInsert = newFilters(filters);
            } else {
                filtersToInsert = newFilters;
            }

            setQueryParams(prevQueryParams => {
                const paramsWithoutFilters = Object.keys(prevQueryParams).reduce((acc, qpKey) => {
                    if (!queryKeys.includes(qpKey)) {
                        acc[qpKey] = prevQueryParams[qpKey as keyof typeof prevQueryParams];
                    }
                    return acc;
                }, {} as ParsedUrlQueryInput);

                return { ...paramsWithoutFilters, ...filtersToInsert };
            });
        },
        [setQueryParams, filters]
    );

    return [filters, setFilters] as [typeof filters, typeof setFilters];
};
