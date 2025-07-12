import { VersionedAnswers, Language, Timezone } from '@zinnia/form-engine-sdk';

import CardInfo from '@deps/components/card/card-info/card-info';
import { ReactComponent as ErrorIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { IllustrationsClientCase } from '@deps/types/illustrations';

import { Eapp } from './Eapp';
import { IllustrationHandlerFactory } from '../../helpers/factory/illustrationsHandlerFactory';
import { ActiveSectionProvider } from '../../providers/ActiveSectionProvider';
import { IllustrationProvider } from '../../providers/IllustrationProvider';
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
        // v2: { // Term TL0101
        //     contract: {
        //         '9fd6392a-a71d-41a1-bd6d-215c09de44ab': {
        //             'd0ef9652-d120-4d7f-8e99-b86c9522e41e': {
        //                 'a66ca6bc-2ea4-4b0c-9816-2481fa8029c4': {
        //                     'eafbbfee-eb08-46b2-83e4-85b8b484bb27': 26,
        //                     '73209330-ce34-4084-bff5-dc40a6d966fc': 'NON',
        //                     '21ae1648-1015-4eb3-b266-154ff1b3d3db': 'Ryan',
        //                     'cdac003e-ee4b-42f5-9174-a06ccbdeef62': 'Olsen',
        //                     'fd4db8c2-e5f4-4cc8-a143-4fe1ebdc39c4': 'MALE',
        //                     '160d7706-d2da-4869-8e7b-cecd777be910': '1999-09-19',
        //                     '8547480e-81a4-4778-b71d-870dfc0a3e5b': 'STANDARDNONOBACCO',
        //                 },
        //             },
        //         },
        //         '77b48ce3-46ff-4e76-9b69-6559b84cfe63': {
        //             '73f21b2f-1130-455d-9d10-9ff9fb861895': {
        //                 '643fdc55-8fdc-44bc-bc97-89829cfaf412': {
        //                     'b18cf5ed-a5a1-46f1-89f6-5e61711a12d6': 'CO',
        //                 },
        //             },
        //         },
        //         '0defa8b5-f08b-47be-86b4-96234f271b31': {
        //             '87cb6064-4260-4aa5-8cff-0d4fbcc6f6c6': {
        //                 '388f6f4b-2278-444f-8df3-b2a043f0c905': {
        //                     '87eeddca-274c-44dd-b0b5-f91902917cf8': 'PREMIUM',
        //                     '5aa6d477-e97a-480a-b570-e277ebb4e0da': '30',
        //                     '24f50a03-0e26-4933-89ad-3262e51dcff0': '30',
        //                 },
        //                 '9bb00c0d-2e4e-4688-b0e9-5aa03b187867': {
        //                     '55ebb606-92ee-4ddc-a0b4-ecc7e9acd5d8': 111111,
        //                     '5829b2a4-edde-4a51-bf4a-73637fd6ddb2': 'SEMI_ANNUAL',
        //                     '5f3b6863-5845-4a2d-9cd7-ad0160ec5fbd': 'CREDITCARD',
        //                 },
        //                 '1f2e964b-ca6e-4436-9c3a-07a6f8791746': {
        //                     '84475678-a6f5-4cad-a113-2aa9f174caec': 'SEMI_ANNUAL',
        //                     'e74b86f1-997f-40cf-8a9a-6551d3f1b156': 'CREDITCARD',
        //                 },
        //             },
        //         },
        //     },
        // },

        // v2: {
        //     // IUL IU0101
        //     contract: {
        //         '9fd6392a-a71d-41a1-bd6d-215c09de44ab': {
        //             'd0ef9652-d120-4d7f-8e99-b86c9522e41e': {
        //                 'a66ca6bc-2ea4-4b0c-9816-2481fa8029c4': {
        //                     'eafbbfee-eb08-46b2-83e4-85b8b484bb27': 25,
        //                     '73209330-ce34-4084-bff5-dc40a6d966fc': 'NON',
        //                     '21ae1648-1015-4eb3-b266-154ff1b3d3db': 'Ryan',
        //                     'cdac003e-ee4b-42f5-9174-a06ccbdeef62': 'Olsen',
        //                     'fd4db8c2-e5f4-4cc8-a143-4fe1ebdc39c4': 'MALE',
        //                     '160d7706-d2da-4869-8e7b-cecd777be910': '1999-09-19',
        //                     '8547480e-81a4-4778-b71d-870dfc0a3e5b': 'STANDARDPLUSNONTOBACCO',
        //                     'c5ecf6ea-e9f4-4722-9a11-a683aef67dcc': 'Ryan',
        //                     '432e23be-f3dd-4d15-9af5-e6fa42646f2e': 'Olsen',
        //                 },
        //             },
        //         },
        //         '77b48ce3-46ff-4e76-9b69-6559b84cfe63': {
        //             '73f21b2f-1130-455d-9d10-9ff9fb861895': {
        //                 '643fdc55-8fdc-44bc-bc97-89829cfaf412': {
        //                     'b18cf5ed-a5a1-46f1-89f6-5e61711a12d6': 'CO',
        //                 },
        //             },
        //         },
        //         '0defa8b5-f08b-47be-86b4-96234f271b31': {
        //             '87cb6064-4260-4aa5-8cff-0d4fbcc6f6c6': {
        //                 '388f6f4b-2278-444f-8df3-b2a043f0c905': {
        //                     '87eeddca-274c-44dd-b0b5-f91902917cf8': 'PREMIUM',
        //                     '5aa6d477-e97a-480a-b570-e277ebb4e0da': '30',
        //                     '24f50a03-0e26-4933-89ad-3262e51dcff0': '30',
        //                 },
        //                 '9bb00c0d-2e4e-4688-b0e9-5aa03b187867': {
        //                     '55ebb606-92ee-4ddc-a0b4-ecc7e9acd5d8': 111111,
        //                     '5829b2a4-edde-4a51-bf4a-73637fd6ddb2': 'SEMI_ANNUAL',
        //                     '5f3b6863-5845-4a2d-9cd7-ad0160ec5fbd': 'CREDITCARD',
        //                 },
        //                 '1f2e964b-ca6e-4436-9c3a-07a6f8791746': {
        //                     '84475678-a6f5-4cad-a113-2aa9f174caec': 'SEMI_ANNUAL',
        //                     'e74b86f1-997f-40cf-8a9a-6551d3f1b156': 'CREDITCARD',
        //                 },
        //             },
        //             'ff8de8dc-9c95-4503-bac3-b92ee3bb637f': {
        //                 '2f6d14b8-1146-4d83-a24e-63a6fcdefcbd': {
        //                     '2f26f6f0-df79-444d-b29e-78c65db88c1d': 'FACE',
        //                 },
        //                 'a99b970c-b358-48ca-967c-087fcb63ecdc': {
        //                     'ada64a6a-b420-416c-9a6b-1e9d7f055659': 'SOLVE_FOR_TARGET_CASH_VALUE',
        //                     'cba28c1d-d763-47d7-b602-f3016feb24e8': 111111,
        //                     'c0a05014-9007-4c46-b364-2f04f4c8d0f2': 8,
        //                     '693e5058-f7a9-4d8a-a7c5-9f4b075b367c': 11108,
        //                     'b54a18f0-6338-4668-a649-95927c2c759d': 'YEARS',
        //                     'b2a9679f-5562-4eb6-85c4-0c96b1331793': 8,
        //                     '9bb05ea6-2c66-4ee7-8312-8a213503dbd7': 'QUARTERLY',
        //                     'c3dbae40-6c22-4812-8fee-cf2db78c0538': 'CREDITCARD',
        //                     'c30920d0-9f55-4c87-941a-35992374ac39': 11,
        //                     'b514a411-beeb-4ddc-8822-4dcb20549197': 8,
        //                     '3fe40113-3f6a-44e1-a27c-c9b69baefd1a': 8,
        //                     '5b97b62a-11e9-42b8-8197-bd3660b2ea95': 7,
        //                     'c9e076b5-9385-4307-8a61-7e35364e92db': 'NON',
        //                 },
        //                 'c1aea97b-c804-4407-939f-0b92c44b6037': {
        //                     '7a4545a0-6496-4227-964b-3e7ea2169a2f': 'SOLVE_FOR_TARGET_CASH_VALUE',
        //                     '9425bef7-fcd1-4bb2-ab33-c737b64d26bf': 8,
        //                     '076ad6a3-6cc7-4dd2-a1e3-583c796d4dd3': 11108,
        //                     '307f9624-3305-47bb-902e-a620bccc9bf1': 'YEARS',
        //                     '256aabac-9785-4d0c-8068-67466c3d9bcd': 8,
        //                     '5d72fb55-7bd5-4f9f-91a6-65843c00e0d4': 'QUARTERLY',
        //                     'c6d51e5b-0bc7-4a61-827e-bee6d10cdcd7': 'CREDITCARD',
        //                     '506d9d23-d7fd-498d-8251-3a3c9f194094': 11,
        //                     '0ec96674-1ec3-478b-8c3a-6003ee85d272': 8,
        //                     '9c443d9b-9a7a-4acd-8574-926281404311': 8,
        //                     '12b7c808-3db1-42e2-8546-9820068ad5f8': 7,
        //                     '82959904-b118-43a0-ae7e-7641a8180e4c': 'NON',
        //                 },
        //                 '4a16a9ad-94e5-4d3a-9716-ab288633beb7': {
        //                     'eb17d4c7-d6eb-4ccb-8e5c-b0ab5c365895': 111111,
        //                     '87ce384e-34f8-42a5-b5c4-3dfd261298b7': 8,
        //                     'b28baa56-8373-4eba-b47b-6c4bfeb2f020': 'QUARTERLY',
        //                     '26540a92-c103-4a5c-a93b-2cca98aff5e9': 'CREDITCARD',
        //                     '7f96885f-59e9-484c-9962-7c84bec5c2be': 11,
        //                     'aaa533ec-a2e1-4180-8b49-3726642a1cb2': 8,
        //                     '93452e18-ef31-4576-9786-571fd1c75051': 8,
        //                     'f2d528ef-f4ce-41ee-ab30-38cbe9611c1f': 7,
        //                     'b640d8d6-3d9f-49d4-9cc8-7a421e7230b9': 'NON',
        //                 },
        //                 '8430c2dd-455f-474f-8519-7e859c65e92b': {
        //                     'ec06d4e9-741d-4f02-a0af-b18924d3690f': 111111,
        //                     '8d86b2df-45e9-4fb3-aeaa-765ab69c2caf': 'QUARTERLY',
        //                     'e81fcedb-ab6c-4f7c-8804-60ffdb1458ab': 'CREDITCARD',
        //                     '403162d6-a32d-4541-9bff-39b69a7770bb': 11,
        //                     'b32eef86-a0c2-4681-9363-53743c991feb': 8,
        //                     '699938b5-6832-414f-bf84-ecc4aafda202': 8,
        //                     '07549085-5716-493f-8921-72582076021c': 7,
        //                     '1a9da7c0-fb1d-4dff-ad4d-7e3b6dfc2309': 'NON',
        //                 },
        //             },
        //         },
        //         '263711f4-2fd9-4133-99f1-0ef53c65f434': {
        //             '0de55e06-efba-4fd8-b172-af3084b04c30': {
        //                 'dedb9431-0b2e-449a-a167-7cb01138dbbd': {
        //                     'bf7b2782-ebd5-4def-87af-5b19d5356dec': 'level',
        //                     '60d47d4c-b1a9-4e16-9475-ee03e4d82a2c': 'yes',
        //                     '76463bdd-b853-43e0-a7af-c3cfc282a294': 46,
        //                     'b761d886-0d22-444f-a218-a2c5db0759d4': 50,
        //                     '3b357e2c-5df0-4093-977b-35f422998ec2': '2025-07-03',
        //                     'bef51498-2496-4991-b55c-fa6c4522635d': '2025-07-11',
        //                     '1c7847ac-7457-4676-876c-790e2d5fc05f': 'current',
        //                     '9df77d07-e023-441d-97b2-02a00b8fc7bb': 1,
        //                     '42a96a21-ab7a-45e8-9c35-a9343ca7b05f': 1,
        //                     'ad1d2410-bb06-4a46-86fb-87e0ad50872c': 2,
        //                     '213c320c-37c7-466e-a494-17744765ead2': 2,
        //                 },
        //             },
        //         },
        //         'abfe5bb8-bcf0-4105-8a7b-5ba62b9c1d3a': {
        //             'f5466115-624c-436a-8e95-198fa1990b4e': {
        //                 '94356f46-4841-45a8-bd25-67e81e16e6da': {
        //                     '18cb9837-331b-4587-a0a7-c46b416a2f27': 'annual',
        //                     '7db8d6b4-2f15-4e77-95ce-f865feb01b10': 'withdrawToBasis',
        //                     '51a57d59-5cb3-4e19-b328-4b18976969a1': 'borrow',
        //                 },
        //                 '18bf83bc-2d07-4c49-81ca-34087e19c1f6': {
        //                     'b483e323-aa09-4cad-afaf-f9955937f58e': 'MAX',
        //                     'dfa0de32-d2a3-46af-a5e4-452bd17eee74': 1,
        //                     '19235170-1a3f-41e0-88ff-b5287e369d5d': 8,
        //                 },
        //             },
        //         },
        //     },
        // },
        v2: {},
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
                    <IllustrationProvider>
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
                    </IllustrationProvider>
                </QuestionnaireEngineProvider>
            )}
        </>
    );
};

export default EappContainer;
