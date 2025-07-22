import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionnaireEngine } from '@zinnia/form-engine-sdk';
import Router from 'next/router';
import { createContext, PropsWithChildren, useContext } from 'react';

import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { createIllustration } from '@deps/queries/api/client/documents/v3/illustrations';
import { saveIllustrationToClientCase } from '@deps/queries/api/v1/client-cases';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import { useEapp } from './EAppProvider';
import { useQuestionnaireEngine } from './QuestionnaireEngineProvider';
import { IllustrationHandler } from '../helpers/factory/illustrationsHandlerAbstractClass';
import { FarmersEntities } from '../helpers/farmers/famersBlueprintToIllustrationPayloadTL0101';

type SubmitContextValue = {
    onSubmit: () => void;
    onQuickQuote: () => void;
    isError?: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SubmitContext = createContext<SubmitContextValue | undefined>(
    undefined
);

interface SubmitProviderProps extends PropsWithChildren<{}> {
    children: React.ReactNode;
    factoryHandler: IllustrationHandler<FarmersEntities>;
    clientCase?: IllustrationsClientCase;
}
export function SubmitProvider({
    children,
    factoryHandler,
}: SubmitProviderProps) {
    const { onEAppDataChange: onIllustrationDataChange } = useEapp();
    const { questionnaireEngine } = useQuestionnaireEngine();
    const queryClient = useQueryClient();
    const sideSheet = useSideSheetContext();

    const createIllustrationMutation = useMutation({
        mutationKey: ['saveOrderEntryAnswers'],
        mutationFn: async (engine: QuestionnaireEngine): Promise<any> => {
            // Use this next line to debug only. Never access the dump to grab values in the engine.
            // You can use this log in oder to prefil answers in the e-app container
            console.log(
                'engine dump',
                engine.getAnswerResolverInstance().dump()
            );
            const mappedAnswersResult = engine.getSimpleMappingOutput();
            if (!mappedAnswersResult.success) {
                console.log(
                    'Mapped Answers Result error',
                    mappedAnswersResult.error
                );
                return Promise.reject();
            }
            const answers = mappedAnswersResult.value;
            console.log('answers', answers);
            answers.illustrationType = 'SINGLE_ILLUSTRATION';
            if (!answers.illustrationRequestDate) {
                answers.illustrationRequestDate = new Date()
                    .toISOString()
                    .slice(0, 10);
            }

            const createIllustrationPayload =
                factoryHandler.createIllustrationPayloadFromAnswerOutput(
                    mappedAnswersResult.value
                ); //getFarmersCreateIllustrationPayload(mappedAnswersResult.value);
            if (!createIllustrationPayload.success) {
                console.log(
                    'SubmitProvider create illustration payload error',
                    createIllustrationPayload
                );
                return Promise.reject();
            }
            return createIllustration({
                bodyData: createIllustrationPayload.value,
                path: factoryHandler.getIllustrationApiPath(),
            });
        },
        onSuccess: ({ data }) => {
            const clientCase = factoryHandler.getClientCase();

            saveIllustrationToClientCase(
                clientCase.id,
                data.id,
                factoryHandler.generateTitle(data),
                factoryHandler.getPlanType(), // product type
                factoryHandler.getPlanCode() // carrierProductId
            );

            queryClient.invalidateQueries({
                queryKey: ['clientCaseData', clientCase.id],
            });
            queryClient.invalidateQueries({
                queryKey: ['productList', clientCase.id],
            });

            const route = `/illustrations/client-cases/${clientCase.id}/illustrate/${data.id}`;
            Router.push(route, undefined, { shallow: true });

            sideSheet.onClose();
        },
    });

    const quickQuoteIllustrationMutation = useMutation({
        mutationKey: ['saveOrderEntryAnswers'],
        mutationFn: async (engine: QuestionnaireEngine): Promise<any> => {
            // Use this next line to debug only. Never access the dump to grab values in the engine.
            // You can use this log in oder to prefil answers in the e-app container
            console.log(
                'Quick Quote engine dump',
                engine.getAnswerResolverInstance().dump()
            );
            const mappedAnswersResult = engine.getSimpleMappingOutput();
            if (!mappedAnswersResult.success) {
                console.log(
                    'Mapped Answers Result error',
                    mappedAnswersResult.error
                );
                return Promise.reject();
            }
            const answers = mappedAnswersResult.value;
            console.log('answers', answers);
            answers.illustrationType = 'QUICK_QUOTE';
            if (!answers.illustrationRequestDate) {
                answers.illustrationRequestDate = new Date()
                    .toISOString()
                    .slice(0, 10);
            }

            const createIllustrationPayload =
                factoryHandler.createIllustrationPayloadFromAnswerOutput(
                    mappedAnswersResult.value
                ); //getFarmersCreateIllustrationPayload(mappedAnswersResult.value);

            if (!createIllustrationPayload.success) {
                console.log(
                    'SubmitProvider QUICK_QUOTE illustration payload error',
                    createIllustrationPayload
                );
                return Promise.reject();
            }
            return createIllustration({
                bodyData: createIllustrationPayload.value,
                path: factoryHandler.getIllustrationApiPath(),
            });
        },
        onSuccess: ({ data }) => {
            const illustrationData =
                factoryHandler.getIllustrationDataFromResponse(data);

            onIllustrationDataChange(illustrationData);
        },
    });

    return (
        <SubmitContext.Provider
            value={{
                onSubmit: () =>
                    createIllustrationMutation.mutateAsync(
                        questionnaireEngine,
                        {}
                    ),
                onQuickQuote: () =>
                    quickQuoteIllustrationMutation.mutateAsync(
                        questionnaireEngine,
                        {}
                    ),
                isError: createIllustrationMutation.isError,
            }}
        >
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
