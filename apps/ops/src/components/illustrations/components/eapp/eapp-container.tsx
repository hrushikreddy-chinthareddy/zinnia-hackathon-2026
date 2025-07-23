import { VersionedAnswers, Language, Timezone } from '@zinnia/form-engine-sdk';

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

interface EappContainerProps {
    clientCase?: IllustrationsClientCase;
    planCode: string;
}

const EappContainer = (props: EappContainerProps) => {
    const timezoneResult = Timezone.from(DEFAULT_TIMEZONE_NAME);
    if (!timezoneResult.success) {
        // TODO: better error handling if that happens. We will need to retrieve the timezone from the user and validate
        throw new Error('Invalid timezone');
    }

    const illustrationHandlerFactory = IllustrationHandlerFactory(
        props.planCode,
        props.clientCase
    );

    if (!illustrationHandlerFactory) {
        console.log(`Plan code ${props.planCode} not found.`);
    }

    // These answers are prefilled to make development easier. V2 should eventually just be an empty array.
    // Update these answers to see different answers in the questionnaire on load
    const versionedAnswers = new VersionedAnswers({
        v1: {},
        v2: {
            //     contract: {
            //         '263711f4-2fd9-4133-99f1-0ef53c65f434': {
            //             '0de55e06-efba-4fd8-b172-af3084b04c30': {
            //                 'dedb9431-0b2e-449a-a167-7cb01138dbbd': {
            //                     '60d47d4c-b1a9-4e16-9475-ee03e4d82a2c': 'yes',
            //                     'bf7b2782-ebd5-4def-87af-5b19d5356dec': 'level',
            //                     '3a7d59a3-59e7-438b-9549-ad158d3fc0db': 0,
            //                     '9df77d07-e023-441d-97b2-02a00b8fc7bb': 100,
            //                     '76463bdd-b853-43e0-a7af-c3cfc282a294': 0,
            //                     'b761d886-0d22-444f-a218-a2c5db0759d4': 0,
            //                     '3b357e2c-5df0-4093-977b-35f422998ec2': '1',
            //                     'bef51498-2496-4991-b55c-fa6c4522635d': '120',
            //                 },
            //             },
            //         },
            //         '0defa8b5-f08b-47be-86b4-96234f271b31': {
            //             'ff8de8dc-9c95-4503-bac3-b92ee3bb637f': {
            //                 'c1aea97b-c804-4407-939f-0b92c44b6037': {
            //                     '20b89449-c480-48c6-97d6-c5c2c2015c96': 103001,
            //                     '9425bef7-fcd1-4bb2-ab33-c737b64d26bf': 30,
            //                 },
            //                 '4a16a9ad-94e5-4d3a-9716-ab288633beb7': {
            //                     '26540a92-c103-4a5c-a93b-2cca98aff5e9': 'ACH',
            //                     'b28baa56-8373-4eba-b47b-6c4bfeb2f020': 'MONTHLY',
            //                     'ffe36498-ba95-44b5-b92b-ba2b287e7d5d': 103001,
            //                     'eb17d4c7-d6eb-4ccb-8e5c-b0ab5c365895': 112,
            //                     '87ce384e-34f8-42a5-b5c4-3dfd261298b7': 30,
            //                 },
            //                 '2f6d14b8-1146-4d83-a24e-63a6fcdefcbd': {
            //                     '2f26f6f0-df79-444d-b29e-78c65db88c1d': 'NO_SOLVE',
            //                 },
            //                 '67918d23-a023-4def-b857-a3044c2cd2d5': {
            //                     'c0cea165-f33d-4203-917f-38f317996396': 'no',
            //                 },
            //                 'a99b970c-b358-48ca-967c-087fcb63ecdc': {
            //                     'cba28c1d-d763-47d7-b602-f3016feb24e8': 112,
            //                     'c0a05014-9007-4c46-b364-2f04f4c8d0f2': 30,
            //                 },
            //                 '8430c2dd-455f-474f-8519-7e859c65e92b': {
            //                     'ec06d4e9-741d-4f02-a0af-b18924d3690f': 112,
            //                 },
            //             },
            //         },
            //         '9fd6392a-a71d-41a1-bd6d-215c09de44ab': {
            //             'd0ef9652-d120-4d7f-8e99-b86c9522e41e': {
            //                 'a66ca6bc-2ea4-4b0c-9816-2481fa8029c4': {
            //                     '8547480e-81a4-4778-b71d-870dfc0a3e5b':
            //                         'STANDARDNONTOBACCO',
            //                     'b18cf5ed-a5a1-46f1-89f6-5e61711a12d6': 'CA',
            //                     '432e23be-f3dd-4d15-9af5-e6fa42646f2e': 'Kent',
            //                     'c5ecf6ea-e9f4-4722-9a11-a683aef67dcc': 'Clark',
            //                     '160d7706-d2da-4869-8e7b-cecd777be910':
            //                         '1984-02-29',
            //                     'fd4db8c2-e5f4-4cc8-a143-4fe1ebdc39c4': 'MALE',
            //                     'eafbbfee-eb08-46b2-83e4-85b8b484bb27': 41,
            //                     '73209330-ce34-4084-bff5-dc40a6d966fc': 'NON',
            //                     'ec2421a8-9df3-45d9-b15a-fbc6c3c10b28': 'Acle',
            //                     '4b6a010c-d4ec-400a-ad11-8e4c66b4f4cb': 'Eugene',
            //                 },
            //             },
            //         },
            //         '90e31710-b95e-48a1-90e0-e320cd4426cd': {
            //             '8839eee8-f7f1-43a7-90b8-b48dcd2e9a34': {
            //                 '21b8b2f0-2009-425a-bfd6-7a6b6b3fb5ed': {
            //                     '00fef022-990f-41e1-beda-af93990c044c': [
            //                         'Rider_ABRTRM',
            //                     ],
            //                 },
            //             },
            //         },
            //         'abfe5bb8-bcf0-4105-8a7b-5ba62b9c1d3a': {
            //             'f5466115-624c-436a-8e95-198fa1990b4e': {
            //                 '94356f46-4841-45a8-bd25-67e81e16e6da': {
            //                     '18cb9837-331b-4587-a0a7-c46b416a2f27': 'annual',
            //                     '7db8d6b4-2f15-4e77-95ce-f865feb01b10':
            //                         'withdrawToBasis',
            //                     '51a57d59-5cb3-4e19-b328-4b18976969a1': 'borrow',
            //                 },
            //                 '18bf83bc-2d07-4c49-81ca-34087e19c1f6': {
            //                     'b483e323-aa09-4cad-afaf-f9955937f58e': 'AMOUNT',
            //                     'dfa0de32-d2a3-46af-a5e4-452bd17eee74': 1,
            //                     '19235170-1a3f-41e0-88ff-b5287e369d5d': 120,
            //                     '833fd531-e534-456b-97ae-68bd86502293': 0,
            //                 },
            //             },
            //         },
            //     },
        },
    });

    return (
        <>
            {(!props.clientCase || !props.planCode) && (
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
                    clientCase={
                        props.clientCase || ({} as IllustrationsClientCase)
                    }
                    planCode={props.planCode}
                    language={Language.en}
                    versionedAnswers={versionedAnswers}
                    subscribers={[]}
                    timezone={timezoneResult.value}
                    prePopulateData={illustrationHandlerFactory?.mapClientCaseInsuredData()}
                >
                    <EAppProvider>
                        <SubmitProvider
                            factoryHandler={illustrationHandlerFactory}
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
