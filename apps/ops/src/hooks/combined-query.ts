import { UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

interface CombinedQueryBaseResult {
    isFetching: boolean;
}

interface CombinedQueryPendingResult extends CombinedQueryBaseResult {
    data: undefined;
    isPending: true;
    hasError: false;
    isLoading: boolean;
    errors: undefined;
}
interface CombinedQueryResultWithErrors<T> extends CombinedQueryBaseResult {
    data: T;
    isPending: false;
    hasError: true;
    isLoading: false;
    errors: (Error | null)[];
}

interface CombinedQuerySuccessResult<T> extends CombinedQueryBaseResult {
    data: T;
    isPending: false;
    hasError: false;
    isLoading: false;
    errors: null;
}

export type CombinedQueryResult<T> =
    | CombinedQueryPendingResult
    | CombinedQueryResultWithErrors<T>
    | CombinedQuerySuccessResult<T>;

const getQueryResultsMeta = <T>(results: UseQueryResult<T>[]) => ({
    isPending: results.some((result) => result.isPending),
    isFetching: results.some((result) => result.isFetching),
    errors: results.map((result) => result.error),
});

const buildCombinedQueryResult = <T>({
    data,
    isPending,
    isFetching,
    errors,
}: {
    data: T | undefined;
    isPending: boolean;
    isFetching: boolean;
    errors?: (Error | null)[];
}): CombinedQueryResult<T> => {
    const hasError = !!errors?.length;
    if (isPending) {
        return {
            data: undefined,
            isFetching,
            isPending: true,
            isLoading: isFetching,
            hasError: false,
            errors: undefined,
        };
    }

    if (hasError && !isPending) {
        return {
            data: data!,
            isFetching,
            isPending,
            isLoading: false,
            hasError,
            errors,
        };
    }

    return {
        data: data!,
        isFetching,
        isPending: false,
        isLoading: false,
        hasError: false,
        errors: null,
    };
};

export const wrapCombinedQueryResultsData = <T, MT>(
    queryResults: UseQueryResult<T>[],
    combine: (results: UseQueryResult<T>[]) => MT
): CombinedQueryResult<MT> => {
    const { isPending, isFetching, errors } =
        getQueryResultsMeta<T>(queryResults);

    return buildCombinedQueryResult({
        data: combine(queryResults),
        isPending,
        isFetching,
        errors,
    });
};

export const mapCombinedQueryResult = <T, MT>(
    mapperFn: (result: T) => MT,
    combinedResults: CombinedQueryResult<T>
): CombinedQueryResult<MT> => {
    const { isPending } = combinedResults;
    if (isPending) {
        return combinedResults;
    }

    return {
        ...combinedResults,
        data: mapperFn(combinedResults.data),
    };
};

export const useReduceCombinedResults = <T>(
    leftResult: CombinedQueryResult<unknown>,
    rightResult: CombinedQueryResult<T>
): CombinedQueryResult<T | undefined> => {
    const results = [leftResult, rightResult];
    const { data } = rightResult;
    const isPending = results.some(({ isPending }) => isPending);
    const isFetching = results.some(({ isFetching }) => isFetching);

    return useMemo(() => {
        return buildCombinedQueryResult({
            data,
            isPending,
            isFetching,
            errors: [
                ...(rightResult.errors ?? []),
                ...(leftResult.errors ?? []),
            ].filter((error): error is Error => !!error),
        });
    }, [data, isPending, isFetching, leftResult.errors, rightResult.errors]);
};
