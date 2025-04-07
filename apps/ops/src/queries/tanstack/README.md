# Recommended Reading

It's highly recommended to check the first 4 sidebar items in the _Guides & Concepts_ section of the Tanstack Query docs: https://tanstack.com/query/v4/docs/framework/react/guides/important-defaults

## Instructions for using Tanstack in Ops

1. All fetch functions used in tanstack hooks should go into the `tanstack` folder.
2. Fetch functions must return a response or throw an error in order to correctly trigger error states in the tanstack hook.

## GENERAL RULES

-   Do not manage loading/error states in component state. These should come from the tanstack queries.
-   always set `placeholderData: previousData => previousData` to make background fetching look better.
-   To avoid unnecessary requests, pass in the `enabled` prop and set to false if needed.
-   Want to pull a subset of existing data out of the cache? Check out `initialData` and these docs: https://tanstack.com/query/v4/docs/framework/react/guides/initial-query-data#initial-data-from-cache

## Sample fetch function

```
export const getCasesQuery = async (policyNumber?: string) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }

    const response = await getCases({
        limit: 5,
        notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
        policyNumber,
    });

    if (!response) {
        throw 'No data in response';
    }

    return response;
};

```

## Simple tanstack query example

This is an example tanstack request that will return everything you need to show data, errors, or loading states. None of the destructured fields are required. For more details on differences of loading and fetching, or how errors can render, see: https://tanstack.com/query/v4/docs/framework/react/guides/queries#query-basics

```
    const { data: caseData, error: caseError, isLoading: caseLoading, isFetching: caseFetching } = useQuery({
        queryKey: ['caseData', policyDetails.policyNumber],
        queryFn: () => getCasesQuery(policyDetails.policyNumber),
        placeholderData: previousData => previousData,
    });
```
