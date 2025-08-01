import { apiServerBaseUrl } from '@deps/queries/api-config';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import { withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        // Mock data for quick testing
        // return res.status(200).json({
        //     application: {
        //         declined: false,
        //         submissionType: 'ELECTRONIC',
        //         replacementIndicator: false,
        //     },
        //     illustrations: {
        //         source: 'ZINNIA',
        //         illustrationId: '89b16e89-56e9-4f27-be0b-9aa64db05d00',
        //         customIdentifiers: [
        //             {
        //                 key: 'applicationId',
        //                 value: 'UCAAA05201',
        //             },
        //             {
        //                 key: 'crmId',
        //                 value: '001KQ000007RsEaYAK',
        //             },
        //             {
        //                 key: 'traceId',
        //                 value: '2fc7fe8a8b251c5207bacfdcb5d0c6d5',
        //             },
        //             {
        //                 key: 'redirectionURL',
        //                 value: '',
        //             },
        //         ],
        //     },
        //     policy: {
        //         policyStatus: 'PENDING',
        //         policyHoldingForm: 'INDIVIDUAL',
        //         issueCountry: 'US',
        //         riders: [],
        //         feature: {},
        //         payment: {},
        //     },
        //     parties: [
        //         {
        //             partyId: 'testPartyId',
        //             partyRole: 'INSURED',
        //             partyType: 'INDIVIDUAL',
        //             personalInformation: {
        //                 firstName: 'Test',
        //                 lastName: 'User',
        //                 dateOfBirth: '1990-01-01',
        //                 gender: 'MALE',
        //                 birthSex: 'MALE',
        //                 maritalStatus: 'SINGLE',
        //             },
        //         },
        //     ],
        //     caseId: 'CA0000433484',
        // });

        const method = req.method;
        const { eAppId } = req.query;
        let response: Response;

        switch (method) {
            case 'GET':
                response = await EnterpriseTokenApi.get(
                    `${apiServerBaseUrl}/newbusiness/v2/application/${eAppId}`,
                    {},
                    loggingContext
                );

                return res.json(await response.json());
            case 'PATCH':
                response = await EnterpriseTokenApi.patch(
                    `${apiServerBaseUrl}/newbusiness/v2/application/${eAppId}`,
                    JSON.stringify(req.body),
                    {
                        headers: { 'Content-Type': 'application/json' },
                    },
                    loggingContext
                );
                return res.json(await response.json());
            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }
    },
    { file: 'reverse-proxy (slug)', function: 'routeHandler' }
);
