import { http, HttpResponse } from 'msw';

const mockPolicy = {
    policyNumber: 'POL123',
    planCode: 'PLAN1',
    productName: 'Mock Product',
    status: 'Active',
    policyStatus: 'Active',
    issueDate: '2020-01-01',
    insuredName: 'Jane Doe',
    policyOwnerName: 'Jane Doe',
    system: 'zahara',
};

export const handlers = [
    http.get('*/api/policies/:planCode/:policyId', ({ params }) => {
        return HttpResponse.json({
            ...mockPolicy,
            policyNumber: String(params.policyId ?? 'POL123'),
            planCode: String(params.planCode ?? 'PLAN1'),
        });
    }),

    http.post('*/api/fga/v1/check', () => {
        return HttpResponse.json({ allowed: true });
    }),

    http.post(
        '*/api/policies/:planCode/:policyId/beneficiary/eligibilitycheck',
        () => {
            return HttpResponse.json({
                status: 'Success',
                sor: 'ZAHARA',
            });
        }
    ),

    http.get('*/api/auth/me', () => {
        return HttpResponse.json({
            name: 'Test User',
            email: 'test@example.com',
            sub: 'auth0|123',
            partyId: 'party-123',
        });
    }),
];
