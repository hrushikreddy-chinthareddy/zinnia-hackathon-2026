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
        staleTime: 600_000,
        enabled: !variantParams?.notAvailabilityReasonField,
    });

export const useQuickQuoteQueries = <MT>(
    {
        quickQuoteParams,
        variants,
    }: {
        quickQuoteParams: QuickQuoteParams;
        variants: SingleTermProductQuickQuoteParams[];
    },
    combine: (
        results: UseQueryResult<CreateNewTermLifeIllustrationResponse>[]
    ) => MT
) =>
    useQueries({
        queries: variants.map((variant) =>
            buildNewTermQuickQuoteOptions(quickQuoteParams, variant)
        ),
        combine: useCallback(
            (
                results: UseQueryResult<CreateNewTermLifeIllustrationResponse>[]
            ) => wrapCombinedQueryResultsData(results, combine),
            [combine]
        ),
    });
