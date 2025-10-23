import { FormProvider, useForm } from 'react-hook-form';

import {
    NO_PARAM_RIDERS,
    PREMIUM_FREE_RIDERS,
    RIDERS_WITH_FACE_AMOUNT,
    QuickQuoteFormState,
    QuickQuoteParams,
} from '@deps/types/quickQuote';

import { QuickQuoteResultsContent } from './results/content/results-content';
import { QuickQuoteResultsProvider } from './results/content/results-context';
import { QuickQuoteResultPageHeader as ResultPageHeader } from './results/page-header';

type QuickQuoteResultsPageProps = {
    quickQuoteParams: QuickQuoteParams;
};

export const QuickQuoteResultsPage = ({
    quickQuoteParams: params,
}: QuickQuoteResultsPageProps) => {
    const { riders, premiumFreeRiders } = params;
    const formMethods = useForm<QuickQuoteFormState>({
        defaultValues: {
            ...params,
            premiumFreeRiders: Object.fromEntries(
                PREMIUM_FREE_RIDERS.map((riderName) => [
                    riderName,
                    riderName in premiumFreeRiders
                        ? premiumFreeRiders[riderName] ?? false
                        : false,
                ])
            ),
            riders: Object.fromEntries([
                ...RIDERS_WITH_FACE_AMOUNT.map(
                    (riderName) => [
                        riderName,
                        {
                            type: 'WITH_FACE_AMOUNT',
                            enabled:
                                riderName in riders
                                    ? !!riders[riderName]
                                    : false,
                            faceAmount:
                                typeof riders[riderName] !== 'number'
                                    ? undefined
                                    : riders[riderName] || undefined,
                        },
                    ],
                    ...NO_PARAM_RIDERS.map((riderName) => [
                        riderName,
                        {
                            type: 'NO_PARAMS',
                            enabled:
                                riderName in riders
                                    ? !!riders[riderName]
                                    : false,
                        },
                    ])
                ),
            ]),
        },
    });
    return (
        <div>
            <FormProvider {...formMethods}>
                <QuickQuoteResultsProvider quickQuoteParams={params}>
                    <ResultPageHeader />
                    <QuickQuoteResultsContent />
                </QuickQuoteResultsProvider>
            </FormProvider>
        </div>
    );
};
