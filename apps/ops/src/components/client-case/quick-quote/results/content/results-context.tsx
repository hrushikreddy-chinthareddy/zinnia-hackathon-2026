import { groupBy, includes, isEqual, zip } from 'lodash';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
} from 'react';

import { getQuickQuoteProductMapping } from '@deps/queries/api/v1/quick-quote';
import { CreateNewTermLifeIllustrationResponse } from '@deps/queries/api/v3/illustrations';
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
    SingleTermProductQuickQuoteParams,
} from '../../helpers';
import {
    useQuickQuoteQueries,
    QuickQuoteVariantError,
    QuickQuoteVariantNotAvailableError,
} from '../../hooks';

type QuickQuoteResultsContextState = {
    isLoading: boolean;
    isFetching: boolean;
    isPending: boolean;
    results: QuickQuoteResult[] | undefined;
    filterIneligibilityReasons: (
        reasons: nonEligibleReasonByClass[] | undefined
    ) => IneligibilityReason[];
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

interface WrappedIllustrationResultBase {
    planCode: string;
    variant: SingleTermProductQuickQuoteParams;
}

interface WrappedSuccessIllustrationResult
    extends CreateNewTermLifeIllustrationResponse,
        WrappedIllustrationResultBase {
    error: undefined;
}

interface WrappedErrorIllustrationResult extends WrappedIllustrationResultBase {
    response: undefined;
    error: QuickQuoteVariantError;
}

interface WrappedPendingIllustrationResult
    extends WrappedIllustrationResultBase {
    response: undefined;
    error: undefined;
}

type WrappedIllustrationResult =
    | WrappedSuccessIllustrationResult
    | WrappedPendingIllustrationResult
    | WrappedErrorIllustrationResult;

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
        ): IneligibilityReason[] => {
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

            if (!filteredReasons || filteredReasons.length === 0) return [];

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
                        reasons.termLengths &&
                        reasons.termLengths.findIndex(
                            (tl) => tl === termLength
                        ) >= 0
                )
            );
        },
        []
    );

    /**
     * Method implemented to facilitate the comparisson  between reasons
     * specifically and mainly to the scenario where the reason was due to the min age validation.
     * There were cases where the error was not being grouped because the max expected age was different,
     * in those scenarios, the reason array comparisson didn't match.
     * To deal with it, we sanitize the reasons array and in case the error reason was due to a min age validation
     * the max expected age is being overriden. This is only for the comparisson step, we are still saving the
     * original reasons array.
     *
     * @example
     * [
     *  { field: 'age', value: 15, expected: [18, 60] },
     *  { field: 'face', ... }}
     * ]
     * @returns
     * [
     *  { field: 'age', value: 15, expected: [18, 0] },
     *  { field: 'face', ... }}
     * ]
     */
    const sanitizeReasonArray = useCallback(
        (
            reasons: IneligibilityReason[] | undefined
        ): IneligibilityReason[] | undefined => {
            return reasons?.map((r) => {
                // For errors other than age, return them
                if (r.field !== 'age') return r;

                const minAge = r.expected[0];
                // If the error was due to the age is lesser than the minimun, override the max range to homologate with other reasons
                const maxAge = r.actual <= minAge ? 0 : r.expected[1];

                return {
                    ...r,
                    expected: [minAge, maxAge],
                };
            });
        },
        []
    );

    const groupRiderErrors = useCallback(
        (
            reasons: TermQuickQuoteRiderNotAvailableItem[]
        ): TermQuickQuoteRiderNotAvailableItem[] => {
            const grouped = reasons.reduce(
                (acc: TermQuickQuoteRiderNotAvailableItem[], reason) => {
                    if (!reason.reasons) return acc;

                    const accReason = acc.find((a) =>
                        isEqual(
                            sanitizeReasonArray(a.reasons),
                            sanitizeReasonArray(reason.reasons)
                        )
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
        [sanitizeReasonArray]
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
                const items = zip(results, variants).map(
                    ([result, variant]): WrappedIllustrationResult => {
                        if (!result || !variant) {
                            // Only for type narrowing
                            // `results` and `variants` should always have
                            // the same length
                            throw new Error('Array length mismatch');
                        }

                        if (result.data) {
                            return {
                                ...result.data,
                                variant,
                                error: undefined,
                            };
                        }

                        if (result.isPending)
                            return {
                                planCode: variant.planCode,
                                response: undefined,
                                variant,
                                error: undefined,
                            };

                        const { error } = result;

                        if (error instanceof QuickQuoteVariantError) {
                            const { variant } = error;

                            const isNotAvailableVariant =
                                error instanceof
                                QuickQuoteVariantNotAvailableError;

                            return {
                                planCode: variant.planCode,
                                response: undefined,
                                variant,
                                error: isNotAvailableVariant
                                    ? undefined
                                    : error,
                            };
                        }

                        throw new Error('Got unknown error', { cause: error });
                    }
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
                                data: WrappedIllustrationResult[]
                            ) =>
                                data.find(
                                    (
                                        item
                                    ): item is WrappedErrorIllustrationResult =>
                                        item.error != null
                                )?.variant?.notAvailabilityReasonField;

                            const extractRiderNotAvailabilityReason = (
                                data: WrappedIllustrationResult[],
                                riderCode: RiderCode
                            ) =>
                                data.find(
                                    (item) =>
                                        item.variant.riders[riderCode].reasons
                                            .length > 0
                                )?.variant?.riders?.[riderCode].reasons;

                            const isAvailableResponse = (
                                item:
                                    | CreateNewTermLifeIllustrationResponse['response']
                                    | undefined
                            ): item is Extract<
                                CreateNewTermLifeIllustrationResponse['response'],
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
                                    ).map(([rawTermLength, data]) => {
                                        const termLength =
                                            parseInt(rawTermLength);
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

                                        const error = data.find(
                                            ({ error }) => error
                                        )?.error;

                                        if (error) {
                                            return {
                                                termLength,
                                                range: undefined,
                                                available: true,
                                                error,
                                            };
                                        }

                                        if (notAvailabilityReasonField) {
                                            return {
                                                termLength,
                                                available: false,
                                                notAvailabilityReasonField,
                                                error: undefined,
                                            };
                                        }

                                        return {
                                            termLength,
                                            range,
                                            available: true,
                                            error: undefined,
                                        };
                                    }),
                                    basePremiumRange: Object.entries(
                                        groupedByTermLength
                                    ).map(([rawTermLength, data]) => {
                                        const termLength =
                                            parseInt(rawTermLength);
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

                                        const error = data.find(
                                            ({ error }) => error
                                        )?.error;

                                        if (error) {
                                            return {
                                                termLength,
                                                range: undefined,
                                                available: true,
                                                error,
                                            };
                                        }

                                        if (notAvailabilityReasonField) {
                                            return {
                                                termLength,
                                                available: false,
                                                notAvailabilityReasonField,
                                                error: undefined,
                                            };
                                        }

                                        return {
                                            termLength,
                                            range,
                                            available: true,
                                            error: undefined,
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
                return result;
            },
            [products, variants, groupRiderErrors]
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
