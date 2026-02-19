import { http, HttpResponse } from 'msw';

const mockPolicy = {
    policyNumber: 'POL123',
    carrierId: 'SBLI',
    status: 'Active',
    policyStatus: 'Active',
    system: 'zahara',
    product: {
        planCode: 'PLAN1',
        marketingName: 'Mock Product',
        lineOfBusiness: 'LIFE',
        productType: 'WHOLE_LIFE',
    },
    policyDates: {
        issueDate: '2020-01-01',
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
                ...mockPolicy,
                policyNumber: String(params.policyId ?? 'POL123'),
                product: {
                    ...mockPolicy.product,
                    planCode: String(params.planCode ?? 'PLAN1'),
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
];
