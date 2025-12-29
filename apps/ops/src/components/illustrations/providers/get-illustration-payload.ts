import { QuestionnaireEngine } from '@zinnia/form-engine-sdk';

import { browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { IllustrationHandler } from '../helpers/factory/illustrationsHandlerAbstractClass';

export const getIllustrationPayload = async ({
    factoryHandler,
    engine,
    illustrationType,
}: {
    engine: QuestionnaireEngine;
    illustrationType: string;
    factoryHandler: IllustrationHandler<unknown>;
}) => {
    const mappedAnswersResult = engine.getSimpleMappingOutput();
    if (!mappedAnswersResult.success) {
        browserLogInfo(
            'illustrations::Eapp::SubmitProvider::getIllustrationPayload Error parsing answers',
            {
                ...parseErrorInformation(mappedAnswersResult.error),
                clientCaseId: factoryHandler.getClientCase().id,
            }
        );
        return Promise.reject();
    }
    const answers = { ...mappedAnswersResult.value, illustrationType };

    if (!answers.illustrationRequestDate) {
        answers.illustrationRequestDate = new Date().toISOString().slice(0, 10);
    }

    const createIllustrationPayload =
        factoryHandler.createIllustrationPayloadFromAnswerOutput(answers);

    if (!createIllustrationPayload.success) {
        browserLogInfo(
            'illustrations::Eapp::SubmitProvider::getIllustrationPayload Error parsing output',
            {
                ...parseErrorInformation(createIllustrationPayload.error),
                clientCaseId: factoryHandler.getClientCase().id,
            }
        );
        return Promise.reject();
    }
    return {
        value: createIllustrationPayload.value,
        formInputs: answers,
    };
};
