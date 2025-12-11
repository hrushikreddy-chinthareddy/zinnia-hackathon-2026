import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

import ReceiveNewDocument from './receive-new-document';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}));

const mockStepAdditionalData: CaseAdditionalStepData = {
    id: '75347bb0-e6c2-484a-9ee6-b515ea1511b0',
    label: 'PaymentRecordId',
    value: '75347bb0-e6c2-484a-9ee6-b515ea1511b0',
    dataType: 'OBJECT',
    entityType: 'IDN_CLAIM_AUDIT_RECORD',
    source: 'ENTITY',
};

const mockReceiveNewDocumentData = {
    correlationId: '132f5af9-e614-4e87-90d4-251106000002',
    recordId: '75347bb0-e6c2-484a-9ee6-b515ea1511b0',
    transactionType: 'CLAIM',
    carrier: 'FLIC',
    source: 'BPM.ClaimProcessing',
    entityType: 'IDN_CLAIM_AUDIT_RECORD',
    entity: {
        recordId: '75347bb0-e6c2-484a-9ee6-b515ea1511b0',
        recordType: 'IDN_CLAIM_AUDIT_RECORD',
        fileRowData: [
            {
                source: 'OBT',
                contractNumber: '553003968',
                city: 'WHITEHOUSE STATION',
                state: 'NJ',
                account: '17688',
                clientSSN: '603-73-5814',
                clientLast: 'PITERSON',
                clientFirst: 'PATRICK',
                clientDOB: '1988-01-01',
                group: 'SecureFore',
                cu2: 'Male',
                cu3: 'Claim',
                cu4: '903948230',
                pbiLast: 'PITERSON',
                pbiFirst: 'PATRICK',
                pbiDOB: '01-01-1988',
                pbiDOD: '2025-02-02',
                pbiCity: 'WHITEHOUSE STATION',
                pbiState: 'NJ',
                url1: 'https://cloud.pbinfo.com/pbiresearch/obit/v2/43060937/A7C0FAB377C2F2361DDDDF4D6A972A13',
                url2: 'None',
                url3: 'None',
                url4: 'None',
                url5: 'None',
                correlationid: '132f5af9-e614-4e87-90d4-251106000002',
            },
        ],
        carrierId: 'FLIC',
        lcCompanyId: '903948230',
        policyNumber: '553003968',
        owners: [
            {
                party: {
                    firstName: 'PATRICK',
                    lastName: 'PITERSON',
                    dateOfBirth: '1988-01-01',
                    ssn: '603-73-5814',
                },
                isDeceased: true,
                isDiedInForeignCountry: false,
                dateOfDeath: '2025-02-02',
            },
        ],
        dateOfNotification: '2025-11-07',
        zlCaseId: 'CA0000546465',
        zlCaseLink: 'NIGO',
        zlCaseLinkStatus: 'Manual processing required',
        auditQualCaseMatchingTaskResponse: {
            decision: 'EXISTING_ONBASE_CASE',
            existingOnbaseDocumentId: '20250423-MAN-678490',
        },
    },
    createdTs: '2025-11-07T03:18:58.000Z',
    updatedTs: '2025-11-07T09:05:07.000Z',
    updatedBy: 'BPM.ClaimProcessing',
    identifiers: [
        {
            identifier: 'policyNumber',
            value: '553003968',
        },
    ],
};

describe('##ReceiveNewDocument', () => {
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

    it('#should render the no data message when no receive new document data available', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: false, data: {} });
        render(
            <ReceiveNewDocument stepAdditionalData={mockStepAdditionalData} />
        );

        expect(
            screen.getByText('receiveNewDocument.noData')
        ).toBeInTheDocument();
    });

    it('#should render the no data message when receive new document data is null', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: null,
        });
        render(
            <ReceiveNewDocument stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText('receiveNewDocument.noData')
        ).toBeInTheDocument();
    });

    it('#should render the loading message when receive new document data is loading', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: true, data: {} });
        render(
            <ReceiveNewDocument stepAdditionalData={mockStepAdditionalData} />
        );

        expect(
            screen.getByText('receiveNewDocument.loadingTransactions')
        ).toBeInTheDocument();
    });

    it('#should render receive new document data is retrieved', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockReceiveNewDocumentData,
        });
        render(
            <ReceiveNewDocument stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText('receiveNewDocument.title')
        ).toBeInTheDocument();

        expect(
            screen.getByText('receiveNewDocument.source')
        ).toBeInTheDocument();
        expect(screen.getByTestId('document-source')).toBeInTheDocument();
        expect(screen.getByText('OBT')).toBeInTheDocument();

        expect(
            screen.getByText('receiveNewDocument.deceasedSsn')
        ).toBeInTheDocument();
        expect(screen.getByTestId('document-ssn')).toBeInTheDocument();
        expect(screen.getByText('***-**-5814')).toBeInTheDocument();

        expect(
            screen.getByText('receiveNewDocument.deceasedFirstName')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('document-deceased-first-name')
        ).toBeInTheDocument();
        expect(screen.getByText('PATRICK')).toBeInTheDocument();
        expect(
            screen.getByText('receiveNewDocument.deceasedLastName')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('document-deceased-last-name')
        ).toBeInTheDocument();
        expect(screen.getByText('PITERSON')).toBeInTheDocument();

        expect(
            screen.getByText('receiveNewDocument.deceasedDob')
        ).toBeInTheDocument();
        expect(screen.getByTestId('document-deceased-dob')).toBeInTheDocument();
        expect(screen.getByText('01-01-1988')).toBeInTheDocument();

        expect(
            screen.getByText('receiveNewDocument.deceasedDod')
        ).toBeInTheDocument();
        expect(screen.getByTestId('document-deceased-dod')).toBeInTheDocument();
        expect(screen.getByText('02-02-2025')).toBeInTheDocument();
    });

    it('#should render error message when error occurs during data retrieval', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockReceiveNewDocumentData,
            isError: true,
        });
        render(
            <ReceiveNewDocument stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText('receiveNewDocument.errorGettingTransactions')
        ).toBeInTheDocument();
    });
});
