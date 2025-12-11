import { useRouter } from 'next/router';
import { ReactNode, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { QuickQuoteFormState, QuickQuoteParams } from '@deps/types/quickQuote';

import {
    buildDefaultFormStateValues,
    buildQuickQuoteParams,
    serializeQuickQuoteParams,
} from './helpers';

type QuickQuoteFormContainerProps = {
    children: ReactNode;
    quickQuoteParams: QuickQuoteParams;
};

export const QuickQuoteFormContainer = ({
    quickQuoteParams: params,
    children,
}: QuickQuoteFormContainerProps) => {
    const router = useRouter();
    const formMethods = useForm<QuickQuoteFormState>({
        defaultValues: buildDefaultFormStateValues(params),
    });

    const { handleSubmit } = formMethods;

    const onSubmit = useCallback(
        async (data: QuickQuoteFormState) => {
            const newParams = buildQuickQuoteParams(data);

            await router.push({
                pathname: '/illustrations/client-cases/quick-quote/results',
                query: serializeQuickQuoteParams(newParams),
            });
        },
        [router]
    );

    return (
        <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>{children}</form>
        </FormProvider>
    );
};
