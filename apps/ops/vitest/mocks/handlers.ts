import { http, HttpResponse } from 'msw';

import policyEndpointData from './policyPage/policyEndpointData.json';

export const mockPolicyData = {
    policyNumber: 'POL456',
    carrierId: 'SBLI',
    status: 'Active',
    policyStatus: 'Active',
    system: 'zahara',
    product: {
        planCode: 'PLAN2',
        lineOfBusiness: 'LIFE',
        marketingName: 'Policy Details Test',
        productType: 'TERM',
    },
    policyDates: {
        issueDate: '2021-01-01',
    },
    parties: [
        {
            partyId: 'party-owner-1',
            firstName: 'Jane',
            lastName: 'Doe',
            partyType: 'PERSON',
            addresses: [
                {
                    addressId: 'addr-1',
                    addressType: 'MAILING',
                    line1: '123 Main St',
                    city: 'Springfield',
                    state: 'IL',
                    zip: '62701',
                },
            ],
            preferredAddressIndicator: 'addr-1',
        },
    ],
    partyRoles: [
        {
            partyId: 'party-owner-1',
            partyRole: 'OWNER',
        },
    ],
};

export const handlers = [
    http.get('*/api/policies/:planCode/:policyId', ({ params }) => {
        return HttpResponse.json({
            data: {
                ...policyEndpointData,
                policyNumber: String(params.policyId ?? 'POL123'),
                product: {
                    ...policyEndpointData.product,
                    planCode: String(params.planCode ?? 'PLAN1'),
                    lineOfBusiness: 'LIFE',
                    productType: 'TERM',
                },
            },
        });
    }),

    http.post('*/api/fga/v1/check', () => {
        return HttpResponse.json({ allowed: true });
    }),

    http.post('*/api/fga/v1/check-policy', () => {
        return HttpResponse.json({ allowed: true });
    }),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/beneficiary/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success', sor: 'ZAHARA' })
    ),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/phonenumber/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/emailaddress/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/freelookcancellation/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/parties/:partyRole/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/onetimepremium/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/systematicprograms/*/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/partialwithdrawalonetime/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),

    http.post(
        '*/api/bpm/v1/policies/:planCode/:policyId/fullsurrender/eligibilitycheck',
        () => HttpResponse.json({ status: 'Success' })
    ),

    http.get(
        '*/api/product-rate/v1/carriers/:carrierId/products/:planCode/benefits/:benefitType/configured-settings/:settingName',
        () => HttpResponse.json({ effectiveDate: {} })
    ),

    http.get('*/api/policy/v1/policies/:planCode/:policyId/transactions', () =>
        HttpResponse.json({ data: [], total: 0 })
    ),

    http.post('*/api/case/v1/cases/search', () => {
        return HttpResponse.json({ data: [], total: 0 });
    }),

    http.get('*/api/auth/me', () => {
        return HttpResponse.json({
            name: 'Test User',
            email: 'test@example.com',
            sub: 'auth0|123',
            partyId: 'party-123',
        });
    }),

    http.get('*/api/mcs/:clientCode/salesentity', ({ params, request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        return HttpResponse.json({
            items: [
                {
                    id: id ?? '154360036',
                    firstName: 'John',
                    lastName: 'Agent',
                    nationalProducerNumber: id ?? '154360036',
                    email: 'agent@example.com',
                    phone: '555-1234',
                    carrierSellingCodeRoles: {},
                },
            ],
            total: 1,
        });
    }),

    http.get(
        '*/api/policies/:planCode/:policyNumber/agents/:agentId',
        ({ params }) => {
            return HttpResponse.json({
                id: String(params.agentId ?? '154360036'),
                firstName: 'John',
                lastName: 'Agent',
                nationalProducerNumber: String(params.agentId ?? '154360036'),
                email: 'agent@example.com',
                phone: '555-1234',
                carrierSellingCodeRoles: {},
            });
        }
    ),

    http.get('*/api/webnonfinancial/claim/v1/initialdeathclaim/exists', () =>
        HttpResponse.json({ exists: false })
    ),

    // Catch-all: block any request that doesn't have an explicit handler above.
    // This prevents real network calls from escaping during tests.
    http.all('*', ({ request }) => {
        throw new Error(
            `[MSW] No handler found for: ${request.method} ${request.url}\nAdd a handler to vitest/mocks/handlers.ts`
        );
    }),
];
