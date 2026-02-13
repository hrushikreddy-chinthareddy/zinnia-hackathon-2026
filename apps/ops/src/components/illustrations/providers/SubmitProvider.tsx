import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionnaireEngine } from '@zinnia/form-engine-sdk';
import { useRouter } from 'next/router';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';

import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import {
    editIllustrationToClientCase,
    saveIllustrationToClientCase,
} from '@deps/queries/api/v1/client-cases';
import { createIllustration } from '@deps/queries/api/v3/illustrations';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import {
    browserLogError,
    browserLogInfo,
    browserLogTrace,
} from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { getIllustrationPayload } from './get-illustration-payload';
import { useQuestionnaireEngine } from './QuestionnaireEngineProvider';
import { IllustrationHandler } from '../helpers/factory/illustrationsHandlerAbstractClass';

type SubmitContextValue = {
    onNewSubmit: () => void;
    onEditSubmit: (oldIllustrationId: string) => void;
    isError?: boolean;
    createIllustrationPending: boolean;
    editIllustrationPending: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SubmitContext = createContext<SubmitContextValue | undefined>(
    undefined
);

interface SubmitProviderProps extends PropsWithChildren {
    children: React.ReactNode;
    factoryHandler: IllustrationHandler<unknown>;
    clientCase?: IllustrationsClientCase;
    submitCallback?: () => void;
}
export function SubmitProvider({
    children,
    factoryHandler,
    submitCallback,
}: SubmitProviderProps) {
    const { questionnaireEngine } = useQuestionnaireEngine();
    const queryClient = useQueryClient();
    const sideSheet = useSideSheetContextLegacy();
    const router = useRouter();

    const createIllustrationMutation = useMutation({
        mutationKey: ['saveOrderEntryAnswers'],
        mutationFn: async (engine: QuestionnaireEngine) => {
            const logPrefix =
                'illustrations::Eapp::SubmitProvider::createIllustrationMutation::mutationFn';
            const clientCase = factoryHandler.getClientCase();
            const carrierCode = factoryHandler.getCarrierCode();
            const payload = await getIllustrationPayload({
                engine,
                factoryHandler,
                illustrationType: 'SINGLE_ILLUSTRATION',
            });
            const inputs = engine.getAnswerResolverInstance().export();

            let createResponse;
            try {
                browserLogTrace(`${logPrefix} Started create illustration`, {
                    clientCaseId: clientCase.id,
                });
                createResponse = await createIllustration({
                    bodyData: payload.value,
                    path: factoryHandler.getIllustrationApiPath(),
                });
                browserLogInfo(
                    `${logPrefix} Illustration created successfully`,
                    {
                        clientCaseId: clientCase.id,
                        illustrationId: createResponse.data.id,
                        illustrationData: createResponse.data,
                    }
                );
            } catch (err) {
                browserLogError(`${logPrefix} Error creating illustration`, {
                    clientCaseId: clientCase.id,
                    payload: payload.value,
                });
                throw err;
            }

            try {
                browserLogTrace(
                    `${logPrefix} Started save illustration to client case`,
                    {
                        clientCaseId: clientCase.id,
                        illustrationId: createResponse.data.id,
                    }
                );
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
            } catch (err) {
                browserLogError(
                    `${logPrefix} Error saving illustration to client case`,
                    {
                        clientCaseId: clientCase.id,
                        illustrationId: createResponse.data.id,
                    }
                );
                throw err;
            }
        },
        onSuccess: async ({ data }) => {
            const clientCase = factoryHandler.getClientCase();

            browserLogInfo(
                'illustrations::Eapp::SubmitProvider::createIllustrationMutation::onSuccess Illustration saved to client case successfully',
                {
                    illustrationId: data?.id,
                    clientCaseId: clientCase.id,
                }
            );

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
        onError: (error) => {
            browserLogError(
                'illustrations::Eapp::SubmitProvider::createIllustrationMutation::onError Error creating illustration',
                {
                    ...parseErrorInformation(error),
                    clientCaseId: factoryHandler.getClientCase().id,
                }
            );
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
                factoryHandler,
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

            browserLogInfo(
                'illustrations::Eapp::SubmitProvider::editIllustrationMutation::onSuccess Illustration edited successfully',
                {
                    illustrationId: data?.id,
                    clientCaseId: clientCase.id,
                    illustrationData: data,
                }
            );

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
        onError: (error) => {
            browserLogError(
                'illustrations::Eapp::SubmitProvider::editIllustrationMutation::onError Error editing illustration',
                {
                    ...parseErrorInformation(error),
                    clientCaseId: factoryHandler.getClientCase().id,
                }
            );
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
            isError: createIllustrationError || editIllustrationError,
            createIllustrationPending,
            editIllustrationPending,
        }),
        [
            createIllustrationError,
            editIllustrationError,
            createIllustrationMutateAsync,
            questionnaireEngine,
            editIllustrationMutateAsync,
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
