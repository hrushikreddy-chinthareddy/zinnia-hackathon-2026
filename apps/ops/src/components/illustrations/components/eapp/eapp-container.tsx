import { VersionedAnswers, Language, Timezone } from '@zinnia/form-engine-sdk';
import { FC } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import { Eapp } from './Eapp';
import { IllustrationHandlerFactory } from '../../helpers/factory/illustrationsHandlerFactory';
import { ActiveSectionProvider } from '../../providers/ActiveSectionProvider';
import { EAppProvider } from '../../providers/EAppProvider';
import { QuestionnaireEngineProvider } from '../../providers/QuestionnaireEngineProvider';
import { SubmitProvider } from '../../providers/SubmitProvider';
// TODO: timezone needs to be taken from the user
const DEFAULT_TIMEZONE_NAME = 'America/Toronto';

interface EappContainer {
    clientCase?: IllustrationsClientCase;
    planCode: string;
    versionedAnswers?: VersionedAnswers;
    submitCallback?: () => void;
}

const EappContainer: FC<EappContainer> = ({
    clientCase,
    planCode,
    versionedAnswers = new VersionedAnswers({ v1: {}, v2: {} }),
    submitCallback,
}) => {
    const timezoneResult = Timezone.from(DEFAULT_TIMEZONE_NAME);
    if (!timezoneResult.success) {
        // TODO: better error handling if that happens. We will need to retrieve the timezone from the user and validate
        throw new Error('Invalid timezone');
    }

    const illustrationHandlerFactory = IllustrationHandlerFactory(
        planCode,
        clientCase
    );

    if (!illustrationHandlerFactory) {
        console.log(`Plan code ${planCode} not found.`);
    }

    return (
        <>
            {(!clientCase || !planCode) && (
                <CardInfo
                    className="mt-8"
                    icon={
                        <ErrorIcon
                            className="text-semantic-warning"
                            height={50}
                            width={50}
                        />
                    }
                    title="Plan code not found"
                />
            )}
            {illustrationHandlerFactory && (
                <QuestionnaireEngineProvider
                    blueprint={illustrationHandlerFactory.getBlueprint()}
                    clientCase={clientCase || ({} as IllustrationsClientCase)}
                    planCode={planCode}
                    language={Language.en}
                    versionedAnswers={versionedAnswers}
                    subscribers={[]}
                    timezone={timezoneResult.value}
                    prePopulateData={illustrationHandlerFactory?.mapClientCaseInsuredData()}
                >
                    <EAppProvider>
                        <SubmitProvider
                            factoryHandler={illustrationHandlerFactory}
                            submitCallback={submitCallback}
                        >
                            <ActiveSectionProvider
                                handleNextSectionActionsOnChangeSection
                            >
                                <Eapp
                                    carrier={illustrationHandlerFactory.getCarrier()}
                                    label={illustrationHandlerFactory.getLabel()}
                                    planCode={illustrationHandlerFactory.getPlanCode()}
                                    planType={illustrationHandlerFactory.getPlanType()}
                                />
                            </ActiveSectionProvider>
                        </SubmitProvider>
                    </EAppProvider>
                </QuestionnaireEngineProvider>
            )}
        </>
    );
};

export default EappContainer;
