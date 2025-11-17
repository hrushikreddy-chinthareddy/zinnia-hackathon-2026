import { createClientCase } from '@deps/queries/api/server/v1/client-cases';
import {
    NewBusiness,
    party,
    PersonalInformation,
    Policy,
} from '@deps/types/new-business';
import { LoggingContext } from '@deps/utils/server-logging';

import {
    buildClientCaseFromNewBusiness,
    isAgentBusinessLabel,
} from './build-client-case-from-new-business';
import { getAgencyIdFromHierarchy } from './get-agency-id-from-hierarchy';
import { getSellingcodeFromPartyReference } from './get-selling-code-from-party-reference';

const loggingContext = {} as LoggingContext;

jest.mock('./get-agency-id-from-hierarchy');
jest.mock('./get-selling-code-from-party-reference');
jest.mock('@deps/queries/api/server/v1/client-cases');

const getAgencyIdFromHierarchyMock = jest.mocked(getAgencyIdFromHierarchy);
const getSellingcodeFromPartyReferenceMock = jest.mocked(
    getSellingcodeFromPartyReference
);

describe('isAgentBusinessLabel', () => {
    it('returns false for an invalid business label', () => {
        expect(isAgentBusinessLabel('random-string')).toBeFalsy;
    });
});

describe('buildClientCaseFromNewBusiness', () => {
    beforeEach(() => {
        getSellingcodeFromPartyReferenceMock.mockResolvedValue(null);
        getAgencyIdFromHierarchyMock.mockResolvedValue(null);
    });

    it.each<[string, Partial<NewBusiness>]>([
        ['parties is missing', {}],
        [
            'caseId is missing',
            {
                parties: [],
            },
        ],
        [
            'there is no insured party',
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'OWNER',
                    },
                ] as party[],
            },
        ],
        [
            'issue state is missing',
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'INSURED',
                    },
                ] as party[],
                policy: {} as Policy,
            },
        ],
        [
            'insured personal information is missing',
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'INSURED',
                    },
                ] as party[],
                policy: {
                    issueState: 'CA',
                } as Policy,
            },
        ],
        [
            'agent party is missing',
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'INSURED',
                        personalInformation: {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '1980-06-10',
                        } as PersonalInformation,
                    },
                ] as party[],
                policy: {
                    issueState: 'CA',
                } as Policy,
            },
        ],
        [
            'agent email is missing',
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'INSURED',
                        personalInformation: {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '1980-06-10',
                        } as PersonalInformation,
                    },
                    {
                        partyRole: 'PRIMARYWRITINGAGENT',
                    },
                ] as party[],
                policy: {
                    issueState: 'CA',
                } as Policy,
            },
        ],
        [
            'agent personal information is missing',
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'INSURED',
                        personalInformation: {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '1980-06-10',
                        } as PersonalInformation,
                    },
                    {
                        partyRole: 'PRIMARYWRITINGAGENT',
                        personalInformation: {},
                        email: {
                            preferredEmailId: '1',
                            emails: [
                                {
                                    id: '1',
                                    type: 'PERSONAL',
                                    address: 'agent@example.com',
                                },
                            ],
                        },
                    },
                ] as party[],
                policy: {
                    issueState: 'CA',
                } as Policy,
            },
        ],
        [
            'agent sellingCode is missing',
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'INSURED',
                        personalInformation: {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '1980-06-10',
                        } as PersonalInformation,
                    },
                    {
                        partyRole: 'PRIMARYWRITINGAGENT',

                        email: {
                            preferredEmailId: '1',
                            emails: [
                                {
                                    id: '1',
                                    type: 'PERSONAL',
                                    address: 'agent@example.com',
                                },
                            ],
                        },
                        personalInformation: {
                            firstName: 'Jane',
                            lastName: 'Dane',
                        },
                    },
                ] as party[],
                policy: {
                    issueState: 'CA',
                } as Policy,
            },
        ],
        [
            'agency is missing',
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'INSURED',
                        personalInformation: {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '1980-06-10',
                        } as PersonalInformation,
                    },
                    {
                        partyRole: 'PRIMARYWRITINGAGENT',
                        email: {
                            preferredEmailId: '1',
                            emails: [
                                {
                                    id: '1',
                                    type: 'PERSONAL',
                                    address: 'agent@example.com',
                                },
                            ],
                        },
                        personalInformation: {
                            firstName: 'Jane',
                            lastName: 'Dane',
                        },
                        identifiers: [
                            {
                                type: 'EXTERNAL',
                                value: 'aor_value',
                                key: 'AOR',
                            },
                            {
                                type: 'EXTERNAL',
                                value: 'upn_value',
                                key: 'UPN',
                            },
                        ],
                    },
                ] as party[],
                policy: {
                    issueState: 'CA',
                } as Policy,
            },
        ],
    ])('throws when %s', async (_, newBussinessObject) => {
        const promise = buildClientCaseFromNewBusiness(
            newBussinessObject as NewBusiness,
            'some-eapp-id',
            loggingContext
        );

        await expect(promise).rejects.toThrow();
    });

    it('returns the client-case payload when birthSex is missing', async () => {
        getAgencyIdFromHierarchyMock.mockResolvedValue('agencyId');

        const clientCasePayload = await buildClientCaseFromNewBusiness(
            {
                caseId: 'case-id',
                parties: [
                    {
                        partyRole: 'INSURED',
                        personalInformation: {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '1980-06-10',
                        } as PersonalInformation,
                    },
                    {
                        partyRole: 'PRIMARYWRITINGAGENT',
                        email: {
                            preferredEmailId: '1',
                            emails: [
                                {
                                    id: '1',
                                    type: 'PERSONAL',
                                    address: 'agent@example.com',
                                },
                            ],
                        },
                        personalInformation: {
                            firstName: 'Jane',
                            lastName: 'Dane',
                        },
                        identifiers: [
                            {
                                type: 'EXTERNAL',
                                value: 'agent',
                                key: 'AOR',
                            },
                            {
                                type: 'EXTERNAL',
                                value: 'SellingCode',
                                key: 'UPN',
                            },
                        ],
                    },
                ] as party[],
                policy: {
                    issueState: 'CA',
                } as Policy,
            } as NewBusiness,
            'some-eapp-id',
            loggingContext
        );

        expect(clientCasePayload).toEqual({
            eAppId: 'some-eapp-id',
            title: 'Untitled Client Case',
            caseManagementCaseId: 'case-id',
            insuredDetails: {
                firstName: 'John',
                lastName: 'Doe',
                sexAtBirth: '',
                dateOfBirth: new Date('1980-06-10T00:00:00.000Z'),
                state: 'CA',
            },
            agentDetails: {
                firstName: 'Jane',
                lastName: 'Dane',
                email: 'agent@example.com',
                sellingCode: 'agentSellingCode',
            },
            agencyId: 'agencyId',
        });
    });

    it('Returns the conversion data', async () => {
        getAgencyIdFromHierarchyMock.mockResolvedValue('agencyId');

        const clientCasePayload = await buildClientCaseFromNewBusiness(
            {
                caseId: 'case-id',
                application: {
                    startDate: '',
                    submissionType: 'ELECTRONIC',
                    policyHistory: [
                        {
                            type: 'CONVERSION',
                            carrier: 'Farmers New World Life',
                            policyNumber: '002267124',
                            mecIndicator: true,
                        },
                    ],
                },
                policy: {
                    planCode: 'IU0101',
                    productType: 'INDEXEDUNIVERSALLIFE',
                    issueState: 'CA',
                    issueCountry: 'US',
                    policyHoldingForm: 'INDIVIDUAL',
                    coverage: {
                        faceAmount: 50000,
                    },
                },
                parties: [
                    {
                        partyId: 'insured-party',
                        partyRole: 'INSURED',
                        partyType: 'INDIVIDUAL',
                        partyCommunication: 'REGULARMAIL',
                        personalInformation: {
                            firstName: 'John',
                            lastName: 'Doe',
                            dateOfBirth: '1980-06-10',
                            birthSex: 'MALE',
                        },
                        email: {
                            preferredEmailId: 'insured-email-id',
                            emails: [
                                {
                                    type: 'PERSONAL',
                                    address: 'insured-email@example.com',
                                    id: 'insured-email-id',
                                },
                            ],
                        },
                    },
                    {
                        partyId: 'agent-party',
                        partyRole: 'PRIMARYSERVICINGAGENT',
                        partyType: 'INDIVIDUAL',
                        partyCommunication: 'REGULARMAIL',
                        personalInformation: {
                            firstName: 'Jane',
                            lastName: 'Dane',
                        },
                        identifiers: [
                            {
                                type: 'EXTERNAL',
                                value: 'agent',
                                key: 'AOR',
                            },
                            {
                                type: 'EXTERNAL',
                                value: 'SellingCode',
                                key: 'UPN',
                            },
                        ],
                        email: {
                            preferredEmailId: 'agent-email-id',
                            emails: [
                                {
                                    type: 'PERSONAL',
                                    address: 'agent@example.com',
                                    id: 'agent-email-id',
                                },
                            ],
                        },
                    },
                ] as party[],
                underwriting: {
                    underwritingRiskClass: 'PREFERREDTOBACCO',
                    decisionRiskClass: 'PREFERREDTOBACCO',
                },
            } as NewBusiness,
            'some-eapp-id',
            loggingContext
        );

        expect(clientCasePayload).toEqual({
            eAppId: 'some-eapp-id',
            title: 'Untitled Client Case',
            caseManagementCaseId: 'case-id',
            insuredDetails: {
                firstName: 'John',
                lastName: 'Doe',
                sexAtBirth: 'Male',
                dateOfBirth: new Date('1980-06-10T00:00:00.000Z'),
                state: 'CA',
                nicotineUser: true,
                underwritingClass: 'PREFERREDTOBACCO',
            },
            agentDetails: {
                firstName: 'Jane',
                lastName: 'Dane',
                email: 'agent@example.com',
                sellingCode: 'agentSellingCode',
            },
            agencyId: 'agencyId',
            isMec: true,
            transactionType: 'CONVERSION',
            originalFaceAmount: 50000,
        });
    });
});
