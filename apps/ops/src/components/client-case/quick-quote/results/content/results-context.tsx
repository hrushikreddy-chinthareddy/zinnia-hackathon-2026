import { createContext, ReactNode, useContext, useMemo } from 'react';

import { ProductTypes } from '@deps/types/product';

import { QuickQuoteResult, TermQuickQuoteResult } from '../../types';

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
    children: ReactNode;
};

export const QuickQuoteResultsProvider = ({
    children,
}: QuickQuoteResultsProviderProps) => {
    // TODO: Result fetching

    const value = useMemo(
        () => ({
            isLoading: false,
            isFetching: false,
            isPending: false,
            results: [
                {
                    productType: ProductTypes.TERM,
                    product: {
                        id: 'bf8c083ba55e436da03aa79666da69e9',
                        productId: 'ZIN-PROD-001',
                        carrierProductId: 'TL0101',
                        productMarketingName: 'Farmers Term Life',
                        carrier: 'FNWL',
                        productLine: 'LIFE',
                        productType: 'TERM',
                        planCode: 'TL0101',
                    },
                    data: {
                        totalPremiumRange: [
                            {
                                termLength: 10,
                                range: [41.64, 56.23],
                            },
                            {
                                termLength: 15,
                                range: [46.59, 61.17],
                            },
                            {
                                termLength: 20,
                                range: [50.59, 66.17],
                            },
                            {
                                termLength: 30,
                                range: [56.59, 71.17],
                            },
                        ],
                        basePremiumRange: [
                            {
                                termLength: 10,
                                range: [25.59, 40.18],
                            },
                            {
                                termLength: 15,
                                range: [30.54, 45.12],
                            },
                            {
                                termLength: 20,
                                range: [34.54, 50.12],
                            },
                            {
                                termLength: 30,
                                range: [40.54, 55.12],
                            },
                        ],
                        riders: {
                            accidentalDeathBenefit: 10.59,
                            acceleratedDeathBenefitForTerminalIllness: true,
                            charitableGiving: true,
                        },
                    },
                },
                {
                    productType: ProductTypes.TERM,
                    product: {
                        id: 'd0a35dc2c79046fab649ea84246f35ff',
                        productId: 'ZIN-PROD-002',
                        carrierProductId: 'TR0101',
                        productMarketingName: 'Farmers Return of Premium Term',
                        carrier: 'FNWL',
                        productLine: 'LIFE',
                        productType: 'TERM',
                        planCode: 'TR0101',
                    },
                    data: {
                        totalPremiumRange: [
                            {
                                termLength: 20,
                                range: [59.79, 74.37],
                            },
                            {
                                termLength: 30,
                                range: [64.79, 79.35],
                            },
                        ],
                        basePremiumRange: [
                            {
                                termLength: 20,
                                range: [40.54, 55.12],
                            },
                            {
                                termLength: 30,
                                range: [45.54, 60.1],
                            },
                        ],
                        riders: {
                            accidentalDeathBenefit: 12.5,
                            acceleratedDeathBenefitForTerminalIllness: true,
                            charitableGiving: true,
                        },
                    },
                },
            ] as TermQuickQuoteResult[],
        }),
        []
    );

    return (
        <QuickQuoteResultsContext.Provider value={value}>
            {children}
        </QuickQuoteResultsContext.Provider>
    );
};
