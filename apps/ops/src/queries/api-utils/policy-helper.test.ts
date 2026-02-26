import { SorSystem } from '@deps/models/policy/enums';
import { IdentificationTypeEnum, Policy } from '@zinnia/api-types/types/sor';

import { updateIdentificationsFromPolicy } from './policy-helper';

const mockPayload = {
    businessKey: '987654321',
    correlationid: 'CORR-12345-ABCDE',
    policyNumber: 'POL1234567',
    planCode: 'PLAN-GOLD',
    carrierId: 'CARR001',
    sorSystem: SorSystem.Zahara,
    onbaseCaseId: 'ONB-20231104-001',
    caseId: 'CASE-20231104-XYZ',
    documentDate: '2025-11-04T10:30:00Z',
    channel: 'Digital',
    policyStatus: 'Active',
    isPrimaryBeneInfoOnFile: true,
    isContingentBeneInfoOnFile: false,
    signatureData: {
        signatures: [],
        isSpousePresent: null,
        isIrrevocableBene: false,
    },
};

describe('policy-helper', () => {
    describe('updateIdentificationsFromPolicy', () => {
        it('should return actionData unchanged if policy is null or undefined', () => {
            const payload = {
                ...mockPayload,
                actionData: [
                    { party: { partyId: '123', identifications: [] } },
                ],
            };
            const result = updateIdentificationsFromPolicy(null, payload);
            expect(result).toBe(payload);
        });

        it('should update identifications in actionData from policy parties', () => {
            const policy = {
                parties: [
                    {
                        partyId: '123',
                        identifications: [
                            {
                                identificationType: IdentificationTypeEnum.SSN,
                                value: '123-45-6789',
                            },
                            {
                                identificationType: IdentificationTypeEnum.TIN,
                                value: 'DL12345',
                            },
                        ],
                    },
                    {
                        partyId: '456',
                        identifications: [
                            {
                                identificationType: IdentificationTypeEnum.SSN,
                                value: '987-65-4321',
                            },
                        ],
                    },
                ],
            };

            const payload = {
                ...mockPayload,
                actionData: [
                    {
                        party: {
                            partyId: '123',
                            identifications: [], // should be replaced
                        },
                    },
                    {
                        party: {
                            partyId: '456',
                            identifications: [
                                {
                                    identificationType:
                                        IdentificationTypeEnum.SSN,
                                    identificationValue: '*****6789',
                                },
                            ], // should be replaced
                        },
                    },
                    {
                        party: {
                            partyId: '789',
                            identifications: [
                                {
                                    identificationType:
                                        IdentificationTypeEnum.SSN,
                                    identificationValue: '455656787',
                                },
                            ], // no matching policy party
                        },
                    },
                ],
            };

            const result = updateIdentificationsFromPolicy(policy, payload);

            expect(result.actionData[0].party.identifications).toEqual([
                {
                    identificationType: IdentificationTypeEnum.SSN,
                    value: '123-45-6789',
                },
                {
                    identificationType: IdentificationTypeEnum.TIN,
                    value: 'DL12345',
                },
            ]);

            expect(result.actionData[1].party.identifications).toEqual([
                {
                    identificationType: IdentificationTypeEnum.SSN,
                    value: '987-65-4321',
                },
            ]);

            expect(result.actionData[2].party.identifications).toEqual([
                {
                    identificationType: IdentificationTypeEnum.SSN,
                    identificationValue: '455656787',
                },
            ]);
        });

        it('should keep actionData unchanged if no matching policy party', () => {
            const policy = {
                parties: [
                    {
                        partyId: '123',
                        identifications: [
                            {
                                identificationType: IdentificationTypeEnum.SSN,
                                value: '123-45-6789',
                            },
                        ],
                    },
                ],
            };

            const payload = {
                ...mockPayload,
                actionData: [
                    {
                        party: {
                            partyId: null,
                            identifications: [
                                {
                                    identificationType:
                                        IdentificationTypeEnum.SSN,
                                    identificationValue: '123-45-6789',
                                },
                            ],
                        },
                    } as any,
                ],
            };

            const result = updateIdentificationsFromPolicy(
                policy as Policy,
                payload
            );
            expect(result).toBe(payload);
        });

        it('should handle missing identifications in policy parties', () => {
            const policy = {
                parties: [{ partyId: '123' }, { partyId: '456' }],
            };

            const payload = {
                ...mockPayload,
                actionData: [
                    { party: { partyId: '123', identifications: [] } },
                    {
                        party: {
                            partyId: '456',
                            identifications: [
                                {
                                    identificationType:
                                        IdentificationTypeEnum.SSN,
                                    identificationValue: '123-498-678',
                                },
                            ],
                        },
                    },
                ],
            };

            const result = updateIdentificationsFromPolicy(policy, payload);

            expect(result.actionData[0].party.identifications).toEqual([]);
            expect(result.actionData[1].party.identifications).toEqual([
                {
                    identificationType: IdentificationTypeEnum.SSN,
                    identificationValue: '123-498-678',
                },
            ]);
        });
    });
});
