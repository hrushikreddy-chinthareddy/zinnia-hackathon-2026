import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import DeathAuditQualification from './detah-audit-qualification';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}));

const mockStepAdditionalData: CaseAdditionalStepData = {
    id: 'e9f0b68e-bd31-4879-a773-9999999',
    label: 'PaymentRecordId',
    value: '1cb3597e-e206-43dd-96c7-b0d5855c016e',
    dataType: 'OBJECT',
    entityType: 'IDN_CLAIM_AUDIT_RECORD',
    source: 'ENTITY',
};

const mockDeathAuditQualificationData = {
    correlationId: '5ed3dfcd-fd1c-4d44-874c-251009000002',
    recordId: '1cb3597e-e206-43dd-96c7-b0d5855c016e',
    transactionType: 'CLAIM',
    carrier: 'FLIC',
    source: 'BPM.ClaimProcessing',
    entityType: 'IDN_CLAIM_AUDIT_RECORD',
    entity: {
        recordId: '1cb3597e-e206-43dd-96c7-b0d5855c016e',
        recordType: 'IDN_CLAIM_AUDIT_RECORD',
        fileRowData: [
            {
                fileBatchId: 'df8e4132-b9af-47da-93d3-2e554151de90',
                source: 'OBT',
                contractNumber: '553004261',
                city: 'ARLINGTON',
                state: 'VA',
                account: '17688',
                clientSSN: '211-22-1013',
                clientLast: 'PITERSON',
                clientFirst: 'PATRICK',
                clientDOB: '1/2/1975',
                group: 'FIA ForeIncome 7-Year BrB',
                cu2: 'Male',
                cu3: 'Active',
                cu4: '903948230',
                pbiLast: 'PITERSON',
                pbiFirst: 'PATRICK',
                pbiDOB: '1/2/1975',
                pbiDOD: '6/2/2025',
                pbiCity: 'ARLINGTON',
                pbiState: 'VA',
                url1: 'https://cloud.pbinfo.com/pbiresearch/obit/v2/43060891/66705F9A28FF9F5B650D329A370EA928',
                url2: 'None',
                url3: 'None',
                url4: 'None',
                url5: 'None',
                correlationid: '5ed3dfcd-fd1c-4d44-874c-251009000002',
            },
        ],
        carrierId: 'FLIC',
        lcCompanyId: '903948230',
        policyNumber: '553004261',
        owners: [
            {
                party: {
                    firstName: 'PATRICK',
                    lastName: 'PITERSON',
                    dateOfBirth: '1/2/1975',
                    ssn: '211-22-1013',
                },
                isDeceased: true,
                isDiedInForeignCountry: false,
                dateOfDeath: '6/2/2025',
            },
        ],
        dateOfNotification: '2025-10-09',
        zlCaseId: 'CA0000511082',
        zlCaseLink: 'EXISTING',
        zlCaseLinkStatus: 'Existing case found',
    },
    createdTs: '2025-10-09T11:24:55.000Z',
    updatedTs: '2025-10-09T11:24:58.000Z',
    identifiers: [
        {
            identifier: 'policyNumber',
            value: '553004261',
        },
    ],
};

describe('##DeathAuditQualification', () => {
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

    it('#should render the no data message when no qualification data available', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: false, data: {} });
        render(
            <DeathAuditQualification
                stepAdditionalData={mockStepAdditionalData}
            />
        );

        expect(
            screen.getByText('deathAuditQualification.title')
        ).toBeInTheDocument();

        expect(screen.getByTestId('idn-case-id-label')).toBeInTheDocument();
        expect(
            screen.getByText('deathAuditQualification.title')
        ).toBeInTheDocument();

        expect(screen.getByTestId('no-idn-case-id')).toBeInTheDocument();
        expect(screen.getByText(DEFAULT_ERROR_STRING)).toBeInTheDocument();
    });

    it('#should render the loading message when qualification data is loading', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: true, data: {} });
        render(
            <DeathAuditQualification
                stepAdditionalData={mockStepAdditionalData}
            />
        );

        expect(
            screen.getByText('deathAuditQualification.loadingTransactions')
        ).toBeInTheDocument();
    });

    it('#should render death audit qualification', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockDeathAuditQualificationData,
        });
        render(
            <DeathAuditQualification
                stepAdditionalData={mockStepAdditionalData}
            />
        );

        expect(
            screen.getByText('deathAuditQualification.title')
        ).toBeInTheDocument();

        expect(screen.getByTestId('idn-case-id-label')).toBeInTheDocument();
        expect(
            screen.getByText('deathAuditQualification.title')
        ).toBeInTheDocument();

        expect(screen.getByTestId('idn-case-id-link')).toBeInTheDocument();
        expect(
            screen.getByText(mockDeathAuditQualificationData.entity.zlCaseId)
        ).toBeInTheDocument();
    });

    it('#should render error message when error occurs during data retrieval', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockDeathAuditQualificationData,
            isError: true,
        });
        render(
            <DeathAuditQualification
                stepAdditionalData={mockStepAdditionalData}
            />
        );
        expect(
            screen.getByText('deathAuditQualification.errorGettingTransactions')
        ).toBeInTheDocument();
    });
});
