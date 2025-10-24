import { groupBy, includes } from 'lodash';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
} from 'react';
import { ArrayValues } from 'type-fest';

import { getQuickQuoteProductMapping } from '@deps/queries/api/v1/quick-quote';
import { useQueryProductsByCarrier } from '@deps/queries/tanstack/clientCaseQueries/clientCaseQueries';
import { ProductTypes } from '@deps/types/product';
import {
    NO_PARAM_RIDERS,
    PREMIUM_FREE_RIDERS,
    RIDERS_WITH_FACE_AMOUNT,
    QuickQuoteResult,
    TermQuickQuoteResult,
    QuickQuoteParams,
} from '@deps/types/quickQuote';

import { asNumberOrRange, placeholderData } from '../../helpers';
import { useQuickQuoteQueries, VariantNotAvailableError } from '../../hooks';

type QuickQuoteResultsContextState = {
    isLoading: boolean;
    isFetching: boolean;
    isPending: boolean;
    results: QuickQuoteResult[] | undefined;
};

const QuickQuoteResultsContext =
    createContext<QuickQuoteResultsContextState | null>(null);

export const useQuickQuoteResults = () => {
    const context = useContext(QuickQuoteResultsContext);

    if (!context) {
        throw new Error(
            'useQuickQuoteResults must be used within a QuickQuoteResultsProvider'
        );
    }

    return context;
};

type QuickQuoteResultsProviderProps = {
    quickQuoteParams: QuickQuoteParams;
    children: ReactNode;
};

export const QuickQuoteResultsProvider = ({
    quickQuoteParams,
    children,
}: QuickQuoteResultsProviderProps) => {
    // TODO: Get real variations based on params
    const variants = useMemo(
        () => getQuickQuoteProductMapping(quickQuoteParams),
        [quickQuoteParams]
    );

    const { data: products, isFetching: isFetchingProducts } =
        useQueryProductsByCarrier({
            carrierCode: 'FNWL',
        });

    const {
        data: results,
        isLoading,
        isFetching,
        isPending,
    } = useQuickQuoteQueries(
        { quickQuoteParams, variants },
        useCallback(
            (results) => {
                const items = results
                    .map((result) => {
                        if (result.data) {
                            return result.data;
                        }

                        const { error } = result;

                        if (error instanceof VariantNotAvailableError) {
                            const { variant } = error;
                            return {
                                planCode: variant.planCode,
                                variant,
                                response: undefined,
                            };
                        }
                    })
                    .filter(
                        (item): item is Exclude<typeof item, undefined> =>
                            item != null
                    );

                return Object.entries(groupBy(items, 'planCode'))
                    .map(
                        ([planCode, sameProductData]):
                            | TermQuickQuoteResult
                            | undefined => {
                            const product = products?.find(
                                (product) => product.planCode == planCode
                            );

                            if (!product) {
                                return;
                            }

                            const groupedByTermLength = groupBy(
                                sameProductData,
                                (item) => {
                                    if ('inputs' in item) {
                                        return item.inputs.options
                                            .fixedCostPeriod;
                                    }

                                    return item.variant.termLength;
                                }
                            );

                            const extractNotAvailabilityReason = (
                                data: typeof sameProductData
                            ) =>
                                data.find(
                                    (
                                        item
                                    ): item is Extract<
                                        typeof item,
                                        { response: undefined }
                                    > =>
                                        item.response == null &&
                                        !!item.variant
                                            .notAvailabilityReasonField
                                )?.variant?.notAvailabilityReasonField;

                            const isAvailableResponse = (
                                item:
                                    | ArrayValues<
                                          typeof sameProductData
                                      >['response']
                                    | undefined
                            ): item is Extract<
                                NonNullable<typeof item>,
                                { assumed: any }
                            > =>
                                item != null &&
                                'assumed' in item &&
                                item.assumed != null;

                            return {
                                product,
                                productType: ProductTypes.TERM,
                                planCode,
                                data: {
                                    totalPremiumRange: Object.entries(
                                        groupedByTermLength
                                    ).map(([termLength, data]) => {
                                        const range = asNumberOrRange(
                                            data
                                                .map((item) => item.response)
                                                .filter(isAvailableResponse)
                                                .map(
                                                    (item) =>
                                                        item.assumed.initial
                                                            .totalModalPremium
                                                )
                                        );

                                        const notAvailabilityReasonField =
                                            extractNotAvailabilityReason(data);

                                        if (range) {
                                            return {
                                                termLength:
                                                    parseInt(termLength),
                                                range,
                                                available: true,
                                            };
                                        }

                                        return {
                                            termLength: parseInt(termLength),
                                            available: false,
                                            notAvailabilityReasonField,
                                        };
                                    }),
                                    basePremiumRange: Object.entries(
                                        groupedByTermLength
                                    ).map(([termLength, data]) => {
                                        const range = asNumberOrRange(
                                            data
                                                .map((item) => item.response)
                                                .filter(isAvailableResponse)
                                                .map(
                                                    ({ assumed }) =>
                                                        assumed.coverages.base
                                                            .modalPremium
                                                )
                                        );

                                        const notAvailabilityReasonField =
                                            extractNotAvailabilityReason(data);

                                        if (range) {
                                            return {
                                                termLength:
                                                    parseInt(termLength),
                                                range,
                                                available: true,
                                            };
                                        }

                                        return {
                                            termLength: parseInt(termLength),
                                            available: false,
                                            notAvailabilityReasonField,
                                        };
                                    }),
                                    riders: Object.fromEntries(
                                        [
                                            ...RIDERS_WITH_FACE_AMOUNT,
                                            ...NO_PARAM_RIDERS,
                                            ...PREMIUM_FREE_RIDERS,
                                        ].map((riderName) => {
                                            const values = sameProductData
                                                .map((data) => data.response)
                                                .filter(isAvailableResponse)
                                                .map(
                                                    (data) =>
                                                        data.assumed.coverages[
                                                            riderName
                                                        ]?.modalPremium
                                                );

                                            if (
                                                includes(
                                                    PREMIUM_FREE_RIDERS,
                                                    riderName
                                                )
                                            ) {
                                                return [
                                                    riderName,
                                                    values.some(
                                                        (v) => v != null
                                                    ),
                                                ] as const;
                                            }

                                            return [
                                                riderName,
                                                asNumberOrRange(values),
                                            ] as const;
                                        })
                                    ),
                                },
                            };
                        }
                    )
                    .filter(
                        (item): item is Exclude<typeof item, undefined> =>
                            item != null
                    );
            },
            [products]
        )
    );

    const value = useMemo(
        () => ({
            isLoading,
            isFetching: isFetching || isFetchingProducts,
            isPending,
            results: results ?? placeholderData,
        }),
        [results, isLoading, isFetching, isFetchingProducts, isPending]
    );

    return (
        <QuickQuoteResultsContext.Provider value={value}>
            {children}
        </QuickQuoteResultsContext.Provider>
    );
};
