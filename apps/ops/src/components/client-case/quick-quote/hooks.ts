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
import { browserLogDebug, browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import {
    buildNewTermQuickQuotePayload,
    SingleTermProductQuickQuoteParams,
} from './helpers';

interface QuickQuoteVariantErrorOptions extends ErrorOptions {
    variant: SingleTermProductQuickQuoteParams;
}

export class QuickQuoteVariantError extends Error {
    variant: SingleTermProductQuickQuoteParams;

    constructor(message: string, opts: QuickQuoteVariantErrorOptions) {
        super(message, opts);
        this.variant = opts.variant;
    }
}

export class QuickQuoteVariantNotAvailableError extends QuickQuoteVariantError {}

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
            const logPrefix =
                'illustrations::QuickQuote::buildNewTermQuickQuoteOptions::queryFn';

            if (!variantParams.available) {
                throw new QuickQuoteVariantNotAvailableError(
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

            let response;

            try {
                response = await createNewTermLifeIllustration(payload);
            } catch (error) {
                browserLogError(`${logPrefix} Error fetching quick quote`, {
                    ...parseErrorInformation(error),
                    params: {
                        variant: variantParams,
                        insuredDetails: quickQuoteParams,
                    },
                    payload,
                });

                throw new QuickQuoteVariantError('QuickQuote got error', {
                    variant: variantParams,
                    cause: error,
                });
            }

            browserLogDebug(`${logPrefix} Quick quote created successfully`, {
                params: {
                    variant: variantParams,
                    insuredDetails: quickQuoteParams,
                },
                illustrationId: response.response.id,
            });

            return response;
        },
        staleTime: 600_000,
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
