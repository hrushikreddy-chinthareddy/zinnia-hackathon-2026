import { groupBy, includes, isEqual, zip } from 'lodash';
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
import { RiderName } from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';
import {
    NO_PARAM_RIDERS,
    PREMIUM_FREE_RIDERS,
    RIDERS_WITH_FACE_AMOUNT,
    QuickQuoteResult,
    TermQuickQuoteResult,
    QuickQuoteParams,
    TermQuickQuoteRiderDataItem,
    RIDER_CODE_MAP,
    TermQuickQuoteRiderNotAvailableItem,
} from '@deps/types/quickQuote';
import {
    IneligibilityReason,
    nonEligibleReasonByClass,
    RiderCode,
} from '@deps/utils/quick-quotes-rules/types';

import {
    asNumberOrRange,
    expandQuickQuoteVariants,
    placeholderData,
} from '../../helpers';
import { useQuickQuoteQueries, VariantNotAvailableError } from '../../hooks';

type QuickQuoteResultsContextState = {
    isLoading: boolean;
    isFetching: boolean;
    isPending: boolean;
    results: QuickQuoteResult[] | undefined;
    filterIneligibilityReasons: (
        reasons: nonEligibleReasonByClass[] | undefined
    ) => IneligibilityReason[] | undefined;
    hasRiderErrorsByTermLength: (
        riders: Partial<Record<RiderName, TermQuickQuoteRiderDataItem>>,
        termLength: number
    ) => boolean;
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
    const filterIneligibilityReasons = useCallback(
        (
            reasons: nonEligibleReasonByClass[] | undefined
        ): IneligibilityReason[] | undefined => {
            if (!reasons || reasons.length === 0) return [];

            const filteredReasons = reasons
                .flatMap((reason) => reason.reasons)
                .filter(
                    (reason, index, self) =>
                        index === self.findIndex((t) => t.field == reason.field)
                );

            filteredReasons.forEach((fr, i) => {
                reasons.forEach((reason) => {
                    if (!reason.reasons.some((r) => r.field === fr.field))
                        filteredReasons.splice(i, 1);
                });
            });

            if (!filteredReasons || filteredReasons.length === 0)
                return undefined;

            return filteredReasons;
        },
        []
    );

    const hasRiderErrorsByTermLength = useCallback(
        (
            riders: Partial<Record<RiderName, TermQuickQuoteRiderDataItem>>,
            termLength: number
        ): boolean => {
            return Object.entries(riders).some(([_, data]) =>
                data.notAvailabilityReasonField?.some(
                    (reasons) =>
                        reasons.termLengths && reasons.termLengths.length > 0
                )
            );
        },
        []
    );

    const groupRiderErrors = useCallback(
        (
            reasons: TermQuickQuoteRiderNotAvailableItem[]
        ): TermQuickQuoteRiderNotAvailableItem[] => {
            const grouped = reasons.reduce(
                (acc: TermQuickQuoteRiderNotAvailableItem[], reason) => {
                    const accReason = acc.find((a) =>
                        isEqual(a.reasons, reason.reasons)
                    );

                    // If not reason is already found in the accumulator, add it
                    if (!accReason) {
                        acc.push(reason);
                    } else {
                        // If found, add the term legth to the existing one
                        accReason.termLengths.push(...reason.termLengths);
                    }

                    return acc;
                },
                []
            );
            return grouped;
        },
        []
    );

    // TODO: Get real variations based on params
    const variants = useMemo(
        () =>
            expandQuickQuoteVariants(
                getQuickQuoteProductMapping(quickQuoteParams)
            ),
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
                const items = zip(results, variants)
                    .map(([result, variant]) => {
                        if (!result || !variant) {
                            return;
                        }

                        if (result.data) {
                            return {
                                ...result.data,
                                variant,
                            };
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

                const result = Object.entries(groupBy(items, 'planCode'))
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

                            const extractRiderNotAvailabilityReason = (
                                data: typeof sameProductData,
                                riderCode: RiderCode
                            ) =>
                                data.find(
                                    (item) =>
                                        item.variant.riders[riderCode].reasons
                                            .length > 0
                                )?.variant?.riders?.[riderCode].reasons;

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

                                        if (range != null) {
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

                                        if (range != null) {
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

                                            const reasonsByTermLength =
                                                groupRiderErrors(
                                                    Object.entries(
                                                        groupedByTermLength
                                                    ).map(
                                                        ([
                                                            termLength,
                                                            data,
                                                        ]) => {
                                                            return {
                                                                termLengths: [
                                                                    parseInt(
                                                                        termLength
                                                                    ),
                                                                ],
                                                                reasons:
                                                                    extractRiderNotAvailabilityReason(
                                                                        data,
                                                                        RIDER_CODE_MAP[
                                                                            riderName
                                                                        ]
                                                                    ),
                                                            } as TermQuickQuoteRiderNotAvailableItem;
                                                        }
                                                    )
                                                );

                                            if (
                                                includes(
                                                    PREMIUM_FREE_RIDERS,
                                                    riderName
                                                )
                                            ) {
                                                return [
                                                    riderName,
                                                    {
                                                        range: values.some(
                                                            (v) => v != null
                                                        ),
                                                        notAvailabilityReasonField:
                                                            reasonsByTermLength.length >
                                                            0
                                                                ? reasonsByTermLength
                                                                : undefined,
                                                    },
                                                ] as const;
                                            }

                                            return [
                                                riderName,
                                                {
                                                    range: asNumberOrRange(
                                                        values
                                                    ),
                                                    notAvailabilityReasonField:
                                                        reasonsByTermLength.length >
                                                        0
                                                            ? reasonsByTermLength
                                                            : undefined,
                                                },
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

                console.log('🚀 ~ QuickQuoteResultsProvider ~ result:', result);
                return result;
            },
            [products, variants]
        )
    );

    const value = useMemo(
        () => ({
            isLoading,
            isFetching: isFetching || isFetchingProducts,
            isPending,
            results: results?.length ? results : placeholderData,
            filterIneligibilityReasons,
            hasRiderErrorsByTermLength,
        }),
        [
            results,
            isLoading,
            isFetching,
            isFetchingProducts,
            isPending,
            filterIneligibilityReasons,
            hasRiderErrorsByTermLength,
        ]
    );

    return (
        <QuickQuoteResultsContext.Provider value={value}>
            {children}
        </QuickQuoteResultsContext.Provider>
    );
};
