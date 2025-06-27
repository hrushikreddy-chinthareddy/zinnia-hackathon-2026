import { useRouter } from 'next/router';
import { ParsedUrlQueryInput } from 'querystring';
import { Dispatch, SetStateAction, useCallback } from 'react';

// Adds and retrieves query params to the URL
// Returns the current query params and a function to update them that operates like setState (value or function)
const useQueryStore = () => {
    const router = useRouter();

    const setParams: Dispatch<SetStateAction<ParsedUrlQueryInput>> =
        useCallback(
            (params: SetStateAction<ParsedUrlQueryInput>) => {
                const newParams =
                    typeof params === 'function'
                        ? params(router.query)
                        : params;
                router.replace(
                    { pathname: router.pathname, query: newParams },
                    undefined,
                    { shallow: true }
                );
            },
            [router]
        );

    return [router.query, setParams] as [typeof router.query, typeof setParams];
};

export default useQueryStore;
