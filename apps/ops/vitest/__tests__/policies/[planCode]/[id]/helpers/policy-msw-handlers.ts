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

export const fundsEligibilityHandlers = [
    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/fundtransfer/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),
    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/fundallocations/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),
    http.get('*/api/funds/v1/carriers/:carrierId/products/:planCode', () =>
        HttpResponse.json({ funds: [] })
    ),
    http.get(
        '*/api/product-rate/v1/carriers/:carrierId/products/:planCode/*',
        () => HttpResponse.json({ effectiveDate: {} })
    ),
];

export const documentsHandlers = [
    http.post('*/api/document/v3/documents/search', () =>
        HttpResponse.json({ documents: [], totalCount: 0 })
    ),
];

export const activityTransactionsHandler = http.get(
    '*/api/policy/v1/policies/:planCode/:policyId/transactions',
    () => HttpResponse.json({ data: [] })
);

// GET transactions (HistoryEventFeed in legacy ActivitySubPage when REVISED_HISTORY_TABLE flag is off)
export const activityHandlers = [
    http.get(
        '*/api/policy/v1/policies/:planCode/:policyId/transactions',
        () => HttpResponse.json({ data: [] })
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
