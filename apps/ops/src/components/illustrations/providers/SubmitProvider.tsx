import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionnaireEngine } from '@zinnia/form-engine-sdk';
import { useRouter } from 'next/router';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { createIllustration } from '@deps/queries/api/v3/illustrations';
import {
    editIllustrationToClientCase,
    saveIllustrationToClientCase,
} from '@deps/queries/api/v1/client-cases';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import { useEapp } from './EAppProvider';
import { useQuestionnaireEngine } from './QuestionnaireEngineProvider';
import { IllustrationHandler } from '../helpers/factory/illustrationsHandlerAbstractClass';
import { FarmersEntities } from '../helpers/farmers/famersBlueprintToIllustrationPayloadTL0101';

type SubmitContextValue = {
    onNewSubmit: () => void;
    onEditSubmit: (oldIllustrationId: string) => void;
    onQuickQuote: () => void;
    isError?: boolean;
    isLoadingQuickQuote: boolean;
    createIllustrationPending: boolean;
    editIllustrationPending: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SubmitContext = createContext<SubmitContextValue | undefined>(
    undefined
);

interface SubmitProviderProps extends PropsWithChildren {
    children: React.ReactNode;
    factoryHandler: IllustrationHandler<FarmersEntities>;
    clientCase?: IllustrationsClientCase;
    submitCallback?: () => void;
}
export function SubmitProvider({
    children,
    factoryHandler,
    submitCallback,
}: SubmitProviderProps) {
    const { onEAppDataChange: onIllustrationDataChange } = useEapp();
    const { questionnaireEngine } = useQuestionnaireEngine();
    const queryClient = useQueryClient();
    const sideSheet = useSideSheetContext();
    const router = useRouter();

    const getIllustrationPayload = async ({
        engine,
        illustrationType,
    }: {
        engine: QuestionnaireEngine;
        illustrationType: string;
    }) => {
        const mappedAnswersResult = engine.getSimpleMappingOutput();
        if (!mappedAnswersResult.success) {
            console.log(
                'Mapped Answers Result error',
                mappedAnswersResult.error
            );
            return Promise.reject();
        }
        const answers = { ...mappedAnswersResult.value, illustrationType };

        // answers.illustrationType = illustrationType;
        if (!answers.illustrationRequestDate) {
            answers.illustrationRequestDate = new Date()
                .toISOString()
                .slice(0, 10);
        }

        const createIllustrationPayload =
            factoryHandler.createIllustrationPayloadFromAnswerOutput(answers);

        if (!createIllustrationPayload.success) {
            console.log(
                'SubmitProvider getIllustrationPayload  error',
                createIllustrationPayload
            );
            return Promise.reject();
        }
        return {
            value: createIllustrationPayload.value,
            formInputs: answers,
        };
    };

    const createIllustrationMutation = useMutation({
        mutationKey: ['saveOrderEntryAnswers'],
        mutationFn: async (engine: QuestionnaireEngine) => {
            const payload = await getIllustrationPayload({
                engine,
                illustrationType: 'SINGLE_ILLUSTRATION',
            });
            const inputs = engine.getAnswerResolverInstance().export();
            const createResponse = await createIllustration({
                bodyData: payload.value,
                path: factoryHandler.getIllustrationApiPath(),
            });
            const clientCase = factoryHandler.getClientCase();
            const carrierCode = factoryHandler.getCarrierCode();

            return await saveIllustrationToClientCase(
                clientCase.id,
                createResponse.data.id,
                factoryHandler.generateTitle(createResponse.data, {
                    ...payload.formInputs,
                    illustrationType: 'SINGLE_ILLUSTRATION',
                }),
                factoryHandler.getPlanType(), // product type
                factoryHandler.getPlanCode(), // carrierProductId
                JSON.stringify(inputs), // illustration inputs
                carrierCode
            );
        },
        onSuccess: async ({ data }) => {
            const clientCase = factoryHandler.getClientCase();

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['illustrationData', data?.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['clientCaseData', clientCase.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['productList', clientCase.id],
                }),
            ]);

            const route = `/illustrations/client-cases/${clientCase.id}/illustrate/${data?.id}`;

            router.push(route);

            submitCallback?.();
            sideSheet.onClose();
        },
    });

    const editIllustrationMutation = useMutation({
        mutationKey: ['editIllustration'],
        mutationFn: async ({
            engine,
            oldIllustrationId,
        }: {
            engine: QuestionnaireEngine;
            oldIllustrationId: string;
        }) => {
            const payload = await getIllustrationPayload({
                engine,
                illustrationType: 'SINGLE_ILLUSTRATION',
            });
            const clientCase = factoryHandler.getClientCase();
            const inputs = engine.getAnswerResolverInstance().export();
            const createResponse = await createIllustration({
                bodyData: payload.value,
                path: factoryHandler.getIllustrationApiPath(),
            });

            return await editIllustrationToClientCase(
                clientCase.id,
                oldIllustrationId || '',
                createResponse.data.id,
                factoryHandler.generateTitle(createResponse.data, {
                    ...payload.formInputs,
                    illustrationType: 'SINGLE_ILLUSTRATION',
                }),
                factoryHandler.getPlanType(), // product type
                factoryHandler.getPlanCode(), // carrierProductId
                JSON.stringify(inputs) // illustration inputs
            );
        },
        onSuccess: async ({ data }) => {
            const clientCase = factoryHandler.getClientCase();

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['illustrationData', data?.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['clientCaseData', clientCase.id],
                }),

                queryClient.invalidateQueries({
                    queryKey: ['productList', clientCase.id],
                }),
            ]);

            const route = `/illustrations/client-cases/${clientCase.id}/illustrate/${data?.id}`;

            router.push(route);

            submitCallback?.();
            sideSheet.onClose();
        },
    });

    const {
        mutateAsync: quickQuoteIllustrationMutateAsync,
        isPending: isLoadingQuickQuote,
    } = useMutation({
        mutationKey: ['saveOrderEntryAnswers'],
        mutationFn: async (engine: QuestionnaireEngine) => {
            const payload = await getIllustrationPayload({
                engine,
                illustrationType: 'QUICK_QUOTE',
            });

            const createResponse = await createIllustration({
                bodyData: payload.value,
                path: factoryHandler.getIllustrationApiPath(),
            });

            return {
                data: createResponse.data,
                formInputs: payload.formInputs,
            };
        },
        onSuccess: ({ data, formInputs }) => {
            const illustrationData =
                factoryHandler.getIllustrationDataFromResponse(data, {
                    ...formInputs,
                    illustrationType: 'QUICK_QUOTE',
                });

            onIllustrationDataChange(illustrationData);
        },
    });

    const {
        isError: createIllustrationError,
        isPending: createIllustrationPending,
        mutateAsync: createIllustrationMutateAsync,
    } = createIllustrationMutation;

    const {
        isError: editIllustrationError,
        isPending: editIllustrationPending,
        mutateAsync: editIllustrationMutateAsync,
    } = editIllustrationMutation;

    const contextValue: SubmitContextValue = useMemo(
        () => ({
            onNewSubmit: () => {
                return createIllustrationMutateAsync(questionnaireEngine, {});
            },
            onEditSubmit: (oldIllustrationId: string) => {
                return editIllustrationMutateAsync(
                    { engine: questionnaireEngine, oldIllustrationId },
                    {}
                );
            },
            onQuickQuote: () =>
                quickQuoteIllustrationMutateAsync(questionnaireEngine, {}),
            isError: createIllustrationError || editIllustrationError,
            isLoadingQuickQuote,
            createIllustrationPending,
            editIllustrationPending,
        }),
        [
            createIllustrationError,
            editIllustrationError,
            isLoadingQuickQuote,
            createIllustrationMutateAsync,
            questionnaireEngine,
            editIllustrationMutateAsync,
            quickQuoteIllustrationMutateAsync,
            createIllustrationPending,
            editIllustrationPending,
        ]
    );

    return (
        <SubmitContext.Provider value={contextValue}>
            {children}
        </SubmitContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubmit(): SubmitContextValue {
    const context = useContext(SubmitContext);

    if (!context) {
        throw new Error('useSubmit must be used within a SubmitProvider');
    }

    return context;
}
