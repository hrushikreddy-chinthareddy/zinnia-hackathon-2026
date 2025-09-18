import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

import ClaimsFundRelease, { ClaimClosureReasons } from './claims-fund-release';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}));

const mockStepAdditionalData: CaseAdditionalStepData = {
    id: 'e9f0b68e-bd31-4879-a773-9999999',
    label: 'PaymentRecordId',
    value: 'e9f0b68e-bd31-4879-a773-9999999',
    dataType: 'SETTLEMENT_REASON',
    entityType: 'IDN_CLAIM_RECORD',
    source: 'ENTITY',
};

const mockDeathClaimPaidData = {
    correlationId: '76afed8a-cca5-422f-942a-111111',
    recordId: 'e9f0b68e-bd31-4879-a773-9999999',
    transactionType: 'CLAIM',
    carrier: 'FLIC',
    source: 'BPM.ClaimProcessing',
    entityType: 'IDN_CLAIM_RECORD',
    entity: {
        recordId: 'e9f0b68e-bd31-4879-a773-9999999',
        recordType: 'IDN_CLAIM_RECORD',
        status: 'CLOSE',
        contractNumber: '551007971',
        onbaseClaimCaseId: '12414949',
        deceasedParties: [
            {
                partyRole: 'OWNER',
                partyType: 'INDIVIDUAL',
                deceasedName: 'PATRICK PITERSON',
                dateOfDeceased: '2025-09-15',
                dateOfNotification: '2025-09-16',
                isDeceased: true,
            },
        ],
        beneReview: {
            beneficiaries: [
                {
                    recordType: 'IDN_CLAIM_BENE_RECORD',
                    party: {
                        partyId: '1810683417',
                        partyRoleId: '-2|0|3',
                        partyRole: 'PRIMARYBENEFICIARY',
                        partyType: 'INDIVIDUAL',
                        prefix: 'Mr.',
                        firstName: 'SAUN',
                        lastName: 'Bene',
                        fullName: 'SAUN Bene',
                        gender: 'MALE',
                        dateOfBirth: '1976-01-02',
                        relationshipToInsured: 'SON',
                        beneficiaryPartyType: 'INDIVIDUAL',
                        beneficiaryPercentage: 100,
                        ssn: '211221029',
                    },
                    notificationPreferences: {
                        notificationMethod: {
                            faxOpted: false,
                            emailOpted: true,
                            mailOpted: false,
                        },
                        email: {
                            emailType: 'PERSONAL',
                            emailAddress: 'testing@zinnia.com',
                            emailId: '-999',
                        },
                        address: {
                            addressId: '222222',
                            addressType: 'DEFAULT',
                            addressLine1: '437 N HIGHLAND AVE',
                            city: 'LOS ANGELES',
                            state: 'CA',
                            zipCode: '90036',
                            country: 'USA',
                            correspondenceOnly: false,
                        },
                        phone: {
                            phoneType: 'HOMEFAX',
                            countryCode: '1',
                            areaCode: '654',
                            dialNumber: '7567546',
                            bestTime: 'Any',
                            phoneId: '40993963',
                        },
                    },
                    isAccurate: true,
                },
            ],
            beneReviewDocumentId: '20250620-O-444444',
            carrierApprovalRequired: false,
        },
        stopTransactions: {
            uncashTransactionIdentified: true,
            uncashTransactionExists: false,
        },
        claimClosure: {
            caseClose: true,
            contractStatus: 'CLAIM',
            date: '2025-09-16',
            reason: ClaimClosureReasons.DEATH_CLAIM_PAID,
            source: 'SOR-Lifecad',
        },
    },
    createdTs: '2025-09-16T09:49:37.000Z',
    updatedTs: '2025-09-16T10:44:38.000Z',
    identifiers: [
        {
            identifier: 'policyNumber',
            value: '551007999',
        },
        {
            identifier: 'zlCaseId',
            value: 'CA0000489123',
        },
    ],
};

const mockCanClaimDataFalse = {
    correlationId: '76afed8a-cca5-422f-942a-111111',
    recordId: 'e9f0b68e-bd31-4879-a773-9999999',
    transactionType: 'CLAIM',
    carrier: 'FLIC',
    source: 'BPM.ClaimProcessing',
    entityType: 'IDN_CLAIM_RECORD',
    entity: {
        recordId: 'e9f0b68e-bd31-4879-a773-9999999',
        recordType: 'IDN_CLAIM_RECORD',
        status: 'CLOSE',
        contractNumber: '551007971',
        onbaseClaimCaseId: '12414949',
        deceasedParties: [
            {
                partyRole: 'OWNER',
                partyType: 'INDIVIDUAL',
                deceasedName: 'PATRICK PITERSON',
                dateOfDeceased: '2025-09-15',
                dateOfNotification: '2025-09-16',
                isDeceased: true,
            },
        ],
        beneReview: {
            beneficiaries: [
                {
                    recordType: 'IDN_CLAIM_BENE_RECORD',
                    party: {
                        partyId: '1810683417',
                        partyRoleId: '-2|0|3',
                        partyRole: 'PRIMARYBENEFICIARY',
                        partyType: 'INDIVIDUAL',
                        prefix: 'Mr.',
                        firstName: 'SAUN',
                        lastName: 'Bene',
                        fullName: 'SAUN Bene',
                        gender: 'MALE',
                        dateOfBirth: '1976-01-02',
                        relationshipToInsured: 'SON',
                        beneficiaryPartyType: 'INDIVIDUAL',
                        beneficiaryPercentage: 100,
                        ssn: '211221029',
                    },
                    notificationPreferences: {
                        notificationMethod: {
                            faxOpted: false,
                            emailOpted: true,
                            mailOpted: false,
                        },
                        email: {
                            emailType: 'PERSONAL',
                            emailAddress: 'testing@zinnia.com',
                            emailId: '-999',
                        },
                        address: {
                            addressId: '222222',
                            addressType: 'DEFAULT',
                            addressLine1: '437 N HIGHLAND AVE',
                            city: 'LOS ANGELES',
                            state: 'CA',
                            zipCode: '90036',
                            country: 'USA',
                            correspondenceOnly: false,
                        },
                        phone: {
                            phoneType: 'HOMEFAX',
                            countryCode: '1',
                            areaCode: '654',
                            dialNumber: '7567546',
                            bestTime: 'Any',
                            phoneId: '40993963',
                        },
                    },
                    isAccurate: true,
                },
            ],
            beneReviewDocumentId: '20250620-O-444444',
            carrierApprovalRequired: false,
        },
        stopTransactions: {
            uncashTransactionIdentified: true,
            uncashTransactionExists: false,
        },
        claimClosure: {
            caseClose: false,
            contractStatus: 'NA',
            date: '2025-09-16',
            reason: ClaimClosureReasons.DEATH_CLAIM_PAID,
            source: 'SOR-Lifecad',
        },
    },
    createdTs: '2025-09-16T09:49:37.000Z',
    updatedTs: '2025-09-16T10:44:38.000Z',
    identifiers: [
        {
            identifier: 'policyNumber',
            value: '551007999',
        },
        {
            identifier: 'zlCaseId',
            value: 'CA0000489123',
        },
    ],
};
const mockSpousalContinuationData = {
    correlationId: '76afed8a-cca5-422f-942a-111111',
    recordId: 'e9f0b68e-bd31-4879-a773-9999999',
    transactionType: 'CLAIM',
    carrier: 'FLIC',
    source: 'BPM.ClaimProcessing',
    entityType: 'IDN_CLAIM_RECORD',
    entity: {
        recordId: 'e9f0b68e-bd31-4879-a773-9999999',
        recordType: 'IDN_CLAIM_RECORD',
        status: 'CLOSE',
        contractNumber: '551007971',
        onbaseClaimCaseId: '12414949',
        deceasedParties: [
            {
                partyRole: 'OWNER',
                partyType: 'INDIVIDUAL',
                deceasedName: 'PATRICK PITERSON',
                dateOfDeceased: '2025-09-15',
                dateOfNotification: '2025-09-16',
                isDeceased: true,
            },
        ],
        beneReview: {
            beneficiaries: [
                {
                    recordType: 'IDN_CLAIM_BENE_RECORD',
                    party: {
                        partyId: '1810683417',
                        partyRoleId: '-2|0|3',
                        partyRole: 'PRIMARYBENEFICIARY',
                        partyType: 'INDIVIDUAL',
                        prefix: 'Mr.',
                        firstName: 'SAUN',
                        lastName: 'Bene',
                        fullName: 'SAUN Bene',
                        gender: 'MALE',
                        dateOfBirth: '1976-01-02',
                        relationshipToInsured: 'SON',
                        beneficiaryPartyType: 'INDIVIDUAL',
                        beneficiaryPercentage: 100,
                        ssn: '211221029',
                    },
                    notificationPreferences: {
                        notificationMethod: {
                            faxOpted: false,
                            emailOpted: true,
                            mailOpted: false,
                        },
                        email: {
                            emailType: 'PERSONAL',
                            emailAddress: 'testing@zinnia.com',
                            emailId: '-999',
                        },
                        address: {
                            addressId: '222222',
                            addressType: 'DEFAULT',
                            addressLine1: '437 N HIGHLAND AVE',
                            city: 'LOS ANGELES',
                            state: 'CA',
                            zipCode: '90036',
                            country: 'USA',
                            correspondenceOnly: false,
                        },
                        phone: {
                            phoneType: 'HOMEFAX',
                            countryCode: '1',
                            areaCode: '654',
                            dialNumber: '7567546',
                            bestTime: 'Any',
                            phoneId: '40993963',
                        },
                    },
                    isAccurate: true,
                },
            ],
            beneReviewDocumentId: '20250620-O-444444',
            carrierApprovalRequired: false,
        },
        stopTransactions: {
            uncashTransactionIdentified: true,
            uncashTransactionExists: false,
        },
        claimClosure: {
            caseClose: true,
            contractStatus: 'ACTIVE',
            date: '2025-09-03',
            reason: ClaimClosureReasons.SPOUSAL_CONTINUATION,
            source: 'SOR-Lifecad',
        },
    },
    createdTs: '2025-09-16T09:49:37.000Z',
    updatedTs: '2025-09-16T10:44:38.000Z',
    identifiers: [
        {
            identifier: 'policyNumber',
            value: '551007999',
        },
        {
            identifier: 'zlCaseId',
            value: 'CA0000489123',
        },
    ],
};

describe('##ClaimsFundRelease', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('#should render the no data message when no fund release data available', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: false, data: {} });
        render(
            <ClaimsFundRelease stepAdditionalData={mockStepAdditionalData} />
        );

        expect(
            screen.getByText('claimsFundRelease.noData')
        ).toBeInTheDocument();
    });

    it('#should render the loading message when data is loading', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: true, data: {} });
        render(
            <ClaimsFundRelease stepAdditionalData={mockStepAdditionalData} />
        );

        expect(
            screen.getByText('claimsFundRelease.loadingTransactions')
        ).toBeInTheDocument();
    });

    it('#should render death claim paid message when claims fund release reason is death claim paid', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockDeathClaimPaidData,
        });
        render(
            <ClaimsFundRelease stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText(
                'claimsFundRelease.claimClosureReasons.deathClaimPaid'
            )
        ).toBeInTheDocument();
    });

    it('#should render the spousal continuation mesasage when claims fund release reason is spousal continuation', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockSpousalContinuationData,
        });
        render(
            <ClaimsFundRelease stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText(
                'claimsFundRelease.claimClosureReasons.spousalContinuation'
            )
        ).toBeInTheDocument();
    });

    it('#should render the no data message when claims data is null', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: null,
        });
        render(
            <ClaimsFundRelease stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText('claimsFundRelease.noData')
        ).toBeInTheDocument();
    });

    it('#should render settlement in progress message when claims canClose flag is false', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockCanClaimDataFalse,
        });
        render(
            <ClaimsFundRelease stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText('claimsFundRelease.settlementInProgress')
        ).toBeInTheDocument();
    });

    it('#should render error message when error occurs during data retrieval', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockCanClaimDataFalse,
            isError: true,
        });
        render(
            <ClaimsFundRelease stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText('claimsFundRelease.errorGettingTransactions')
        ).toBeInTheDocument();
    });
});
