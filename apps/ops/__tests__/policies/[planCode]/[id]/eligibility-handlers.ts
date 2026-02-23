import { http, HttpResponse } from 'msw';

export const personEligibilityHandlers = [
    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/parties/:partyId/partyname/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),
    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/address/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),
    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/communicationpreference/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),
    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/bankaccount/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),
    http.post('*/api/auth/v1/check', () =>
        HttpResponse.json({ allowed: true })
    ),
];

export const formMetadataHandler = http.get(
    '*/api/case/v1/form/metadata',
    () => {
        return HttpResponse.json({
            schemaContent: {
                tabSchemas: [
                    {
                        title: 'Initial Tab',
                        schema: {},
                    },
                    {
                        title: 'Form Tab',
                        schema: {},
                    },
                ],
            },
        });
    }
);
