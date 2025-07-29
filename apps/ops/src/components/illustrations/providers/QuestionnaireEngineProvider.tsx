import {
    AnswersChangedSubscriber,
    BlueprintIdAnswersResolver,
    constructQuestionnaire,
    makeAnswerPathTreeFromBlueprint,
    QuestionnaireBlueprint,
    QuestionnaireEngine,
    RenderingQuestionnaire,
    Timezone,
    VersionedAnswers,
    makeNodeIdToAnswerPathMap,
    Language,
    localizeQuestionnaire,
    ApplicationContext,
    RenderingType,
    PlatformTypes,
    InsuranceModules,
    ApplicationModes,
} from '@zinnia/form-engine-sdk';
import {
    createContext,
    PropsWithChildren,
    ReactElement,
    useContext,
    useMemo,
    useState,
} from 'react';

import { IllustrationsClientCase } from '@deps/types/illustrations';

export type EngineContextValue = {
    questionnaireEngine: QuestionnaireEngine;
    renderingQuestionnaire: RenderingQuestionnaire;
};

export const QuestionnaireEngineContext = createContext<
    EngineContextValue | undefined
>(undefined);

type QuestionnaireEngineProviderProps = PropsWithChildren<{
    applicationContext?: ApplicationContext;
    blueprint: QuestionnaireBlueprint;
    clientCase: IllustrationsClientCase;
    planCode: string;
    language: Language;
    subscribers: AnswersChangedSubscriber[];
    versionedAnswers: VersionedAnswers;
    timezone: Timezone;
    prePopulateData?: unknown;
}>;

export function useQuestionnaireEngine(): EngineContextValue {
    const context = useContext(QuestionnaireEngineContext);

    if (typeof context === 'undefined') {
        throw new Error(
            'useQuestionnaireEngine must be used within a QuestionnaireEngineProvider'
        );
    }

    return context;
}

export function QuestionnaireEngineProvider(
    props: QuestionnaireEngineProviderProps
): ReactElement {
    const [renderingQuestionnaire, setRenderingQuestionnaire] =
        useState<RenderingQuestionnaire>([]);
    // const [illustrationHandler, setIllustrationHandler] = useState<IllustrationHandler<T> | null>(null);

    const questionnaire = useMemo(() => {
        return localizeQuestionnaire(
            constructQuestionnaire(
                props.blueprint,
                makeNodeIdToAnswerPathMap(
                    makeAnswerPathTreeFromBlueprint(props.blueprint)
                )
            ),
            props.language
        );
    }, [props.blueprint, props.language]);

    // const illustrationHandlerFactory = IllustrationHandlerFactory(props.planCode, props.clientCase);

    const [questionnaireEngine] = useMemo(() => {
        const answerResolver = BlueprintIdAnswersResolver.from(
            props.blueprint,
            props.versionedAnswers.v2
        );

        // answerResolver.setAnswer('test', 'ddbbb8bd-11a7-471e-9faa-830fa64a0723');
        const engine = QuestionnaireEngine.from({
            questionnaire,
            answerResolver,
            context: {
                platformTypes: [PlatformTypes.producer],
                insuranceModules: [InsuranceModules.insuranceApplication],
                applicationModes: [ApplicationModes.digital],
            },
            timezone: props.timezone,
            currentDateOverride: null,
            language: Language.en,
            // TODO: if we are to support other languages, we need to pass the right localization dictionnary based on the language to override the default one from the engine
            validationMessages: {
                required: 'Required',
                pastDate: 'Date must be in the past',
                decimal: 'Value must not have more than two decimals',
                currentDate: "Must be today's date",
                futureOrCurrentDate: 'Date must be today or in the future',
                futureDate: 'Date must be in the future',
            },
            applicationContext: props.applicationContext,
            onRenderingQuestionnaireChanged: setRenderingQuestionnaire,
            answerChangedSubscribers: props.subscribers,
            // TODO, have proper localization function
            renderingOptions: {
                displayErrors: false,
                renderingType: RenderingType.web,
            },
        });

        engine.populateSimpleMappingAnswers(props.prePopulateData);

        setRenderingQuestionnaire(engine.renderingQuestionnaire);

        return [engine];
    }, [
        props.blueprint,
        props.versionedAnswers,
        props.subscribers,
        props.applicationContext,
        questionnaire,
        props.timezone,
    ]);

    return (
        <QuestionnaireEngineContext.Provider
            value={{
                questionnaireEngine,
                renderingQuestionnaire,
            }}
        >
            {props.children}
        </QuestionnaireEngineContext.Provider>
    );
}
