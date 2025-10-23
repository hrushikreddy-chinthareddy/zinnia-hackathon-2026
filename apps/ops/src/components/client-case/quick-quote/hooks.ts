import {
    queryOptions,
    useQueries,
    UseQueryResult,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import { wrapCombinedQueryResultsData } from '@deps/hooks/combined-query';
import {
    createNewTermLifeIllustration,
    CreateNewTermLifeIllustrationResponse,
} from '@deps/queries/api/v3/illustrations';
import { QuickQuoteParams } from '@deps/types/quickQuote';
import { ProductClassResult } from '@deps/utils/quick-quotes-rules/types';

import {
    buildNewTermQuickQuotePayload,
    SingleTermProductQuickQuoteParams,
} from './helpers';

interface VariantNotAvailableErrorOption extends ErrorOptions {
    variant: SingleTermProductQuickQuoteParams;
}

export class VariantNotAvailableError extends Error {
    variant: SingleTermProductQuickQuoteParams;

    constructor(message: string, opts: VariantNotAvailableErrorOption) {
        super(message, opts);
        this.variant = opts.variant;
    }
}

export const buildNewTermQuickQuoteOptions = (
    quickQuoteParams: QuickQuoteParams,
    variantParams: SingleTermProductQuickQuoteParams
) =>
    queryOptions({
        queryKey: [
            'illustrations',
            'quick-quote',
            quickQuoteParams,
            variantParams,
        ],
        queryFn: async () => {
            if (!variantParams.available) {
                throw new VariantNotAvailableError(
                    'QuickQuote is not available for these values',
                    {
                        variant: variantParams,
                    }
                );
            }

            const payload = buildNewTermQuickQuotePayload(
                quickQuoteParams,
                variantParams
            );

            return createNewTermLifeIllustration(payload);
        },
        enabled: !variantParams?.notAvailabilityReasonField,
    });

export const useQuickQuoteQueries = <MT>(
    {
        quickQuoteParams,
        variants: rawVariants,
    }: {
        quickQuoteParams: QuickQuoteParams;
        variants: ProductClassResult[];
    },
    combine: (
        results: UseQueryResult<CreateNewTermLifeIllustrationResponse>[]
    ) => MT
) =>
    useQueries({
        queries: rawVariants
            .flatMap(
                ({
                    planCode,
                    termLength,
                    classCodes,
                    notAvailabilityReasonField,
                }) =>
                    classCodes.map((classCode) => ({
                        planCode,
                        termLength,
                        classCode,
                        available: !notAvailabilityReasonField,
                        notAvailabilityReasonField,
                    }))
            )
            .map((variantParams) =>
                buildNewTermQuickQuoteOptions(quickQuoteParams, variantParams)
            ),
        combine: useCallback(
            (
                results: UseQueryResult<CreateNewTermLifeIllustrationResponse>[]
            ) => wrapCombinedQueryResultsData(results, combine),
            [combine]
        ),
    });
