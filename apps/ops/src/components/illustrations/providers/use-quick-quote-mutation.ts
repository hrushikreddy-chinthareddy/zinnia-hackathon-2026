import { useMutation } from '@tanstack/react-query';
import { QuestionnaireEngine } from '@zinnia/form-engine-sdk';

import { createIllustration } from '@deps/queries/api/v3/illustrations';
import { browserLogInfo, browserLogTrace } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { useEapp } from './EAppProvider';
import { getIllustrationPayload } from './get-illustration-payload';
import { IllustrationHandler } from '../helpers/factory/illustrationsHandlerAbstractClass';

export const CREATE_QUICK_QUOTE_MUTATION_KEY = [
    'Illustrations:createQuickQuote',
];

export const useQuickQuoteMutation = ({
    factoryHandler,
}: {
    factoryHandler: IllustrationHandler<unknown>;
}) => {
    const { onEAppDataChange: onIllustrationDataChange } = useEapp();

    return useMutation({
        mutationKey: CREATE_QUICK_QUOTE_MUTATION_KEY,
        mutationFn: async (engine: QuestionnaireEngine) => {
            const payload = await getIllustrationPayload({
                engine,
                factoryHandler,
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

            browserLogTrace(
                'illustrations::Eapp::SubmitProvider::quickQuoteIllustrationMutation::onSuccess QuickQuote',
                {
                    illustrationId: data?.id,
                }
            );

            onIllustrationDataChange(illustrationData);
        },
        onError: (error) => {
            browserLogInfo(
                'illustrations::Eapp::SubmitProvider::quickQuoteIllustrationMutation::onError',
                {
                    ...parseErrorInformation(error),
                }
            );
        },
    });
};
