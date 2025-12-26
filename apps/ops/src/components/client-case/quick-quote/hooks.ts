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
            const logPrefix =
                'illustrations::QuickQuote::buildNewTermQuickQuoteOptions::queryFn';
            console.info('AQUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII');
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
            console.info(
                '🚀 ~ buildNewTermQuickQuoteOptions ~ payload:',
                payload
            );

            let response;

            try {
                response = await createNewTermLifeIllustration(payload);
                console.info(
                    '🚀 ~ buildNewTermQuickQuoteOptions ~ response:',
                    response
                );
            } catch (e) {
                browserLogError(`${logPrefix} Error fetching quick quote`, {
                    ...parseErrorInformation(e),
                    params: {
                        variant: variantParams,
                        insuredDetails: quickQuoteParams,
                    },
                    payload,
                });
                throw e;
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
