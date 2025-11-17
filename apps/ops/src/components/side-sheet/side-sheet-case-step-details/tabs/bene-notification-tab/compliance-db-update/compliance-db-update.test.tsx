import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

import ComplianceDBUpdate from './compliance-db-update';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}));

const mockStepAdditionalData: CaseAdditionalStepData = {
    id: '76971a0e-1b95-4843-854b-5ea6ba8665ee',
    label: 'PaymentRecordId',
    value: '76971a0e-1b95-4843-854b-5ea6ba8665ee',
    dataType: 'OBJECT',
    entityType: 'IDN_CLAIM_AUDIT_BATCH_RECORD',
    source: 'ENTITY',
};

const mockComplianceDBUpdateData = {
    correlationId: '872f5376-f52b-433c-84e1-dd8f0abf22b3',
    recordId: '76971a0e-1b95-4843-854b-5ea6ba8665ee',
    transactionType: 'CLAIM',
    carrier: 'FLIC',
    source: 'BPM.ClaimProcessing',
    entityType: 'IDN_CLAIM_AUDIT_BATCH_RECORD',
    entity: {
        auditBatchSchedule: {
            businessKey: null,
            correlationId: null,
            clientCode: 'FLIC',
            batchYearMonth: '202511',
            startDateTime: '2025-11-10T07:42:14.863038Z',
            endDateTime: '2025-11-30T23:59:59Z',
            outboundSlaDateTime: '2025-11-10T07:43:14.862Z',
            inboundSlaDateTime: '2025-11-10T07:43:14.862Z',
            inboundComplianceSlaDateTime: '2025-11-10T07:43:14.862Z',
        },
        recordId: '76971a0e-1b95-4843-854b-5ea6ba8665ee',
        recordType: 'IDN_CLAIM_AUDIT_BATCH_RECORD',
        businessKey: 'FLIC-202511',
        processInstanceId: 'c6ac6d1e-be08-11f0-adb2-1254ec0b1bbf',
        carrier: 'FLIC',
        startDate: '2025-11-10T07:42:14.863038Z',
        batchYearMonth: '202511',
        caseId: 'CA0000547818',
        status: 'CANCEL',
        outbound: {
            files: [],
            exceptions: [
                {
                    exceptionCause: 'OUTBOUND',
                    nmid: 'DC.EM.033',
                    exceptionId: '27edfb0d-90a3-44e4-9a6a-02ff9809a512',
                    exceptionStatus: 'NEW',
                },
            ],
        },
        inbound: {
            summary: {},
            files: [
                {
                    fileProcessingStatus: 'PROCESSED',
                    fileName: '17688_CertiDeath.20251107.UI011.txt',
                    inboundRecordId: '873cc467-6632-4681-9acf-e884709e62d5',
                    inboundFileData: {
                        totalRecords: '2',
                        fileName: '17688_CertiDeath.20251107.UI011.txt',
                        successfulRecords: '2',
                        failedRecords: '0',
                        correlationid: '5ae67de2-7d23-427c-a87d-a76462d8da49',
                        fileBatchId: '691198bc605eb478f470f07a',
                        fileReceivedDate: '2025-11-10',
                        documentId: '691198bc605eb478f470f07a',
                        ChildEventEndId: '5b0f44cf-11e2-4327-aedb-251110000002',
                        ChildEventStartId:
                            '5b0f44cf-11e2-4327-aedb-251110000001',
                    },
                    inboundFileComplianceData: {
                        totalRecords: '2',
                        fileName: '17688_CertiDeath.20251107.UI011.txt',
                        successfulRecords: '2',
                        failedRecords: '0',
                        correlationid: 'dfb12491-1978-4650-993d-bad3ac0cb720',
                        fileReceivedDate: '2025-11-10',
                    },
                    inboundCasesFile: {
                        documentId: '691198bc605eb478f470f07a',
                        fileName: '17688_CertiDeath.20251107.UI011.txt',
                        fileRecordCount: 2,
                        receivedTimestamp: '2025-11-10T07:48:14.048Z',
                    },
                    cancelledCasesFile: {
                        documentId: '691198c2c7cc956175380a07',
                        fileName: 'CancelFile.csv',
                        fileRecordCount: 1,
                        createdTimestamp: '2025-11-10T07:48:18.501Z',
                    },
                    matchedCasesFile: {
                        documentId: '691198c2c7cc956175380a08',
                        fileName: 'MatchFile.csv',
                        fileRecordCount: 1,
                        createdTimestamp: '2025-11-10T07:48:18.635Z',
                    },
                    summary: {
                        totalRecordCount: 2,
                        cancelledRecordCount: 1,
                        existingCaseCount: 1,
                        newCaseCount: 0,
                    },
                    fileRecords: {
                        '5b0f44cf-11e2-4327-aedb-251110000001': {
                            fileRecordId:
                                '5b0f44cf-11e2-4327-aedb-251110000001',
                            recordStatus: 'CANCEL',
                            zlCaseId: 'CA0000547020',
                            fileRecordData: {
                                fileBatchId: '691198bc605eb478f470f07a',
                                source: 'OBT',
                                contractNumber: '680076289',
                                city: 'WHITEHOUSE STATION',
                                state: 'NJ',
                                account: '17688',
                                clientSSN: '431-33-1867',
                                clientLast: 'mac',
                                clientFirst: 'sam',
                                clientDOB: '01-02-1988',
                                group: 'SecureFore',
                                cu2: 'Male',
                                cu3: 'Claim',
                                cu4: '903948230',
                                pbiLast: 'mac',
                                pbiFirst: 'sam',
                                pbiDOB: '01-02-1988',
                                pbiDOD: '09-09-2025',
                                pbiCity: 'WHITEHOUSE STATION',
                                pbiState: 'NJ',
                                url1: 'https://cloud.pbinfo.com/pbiresearch/obit/v2/43060937/A7C0FAB377C2F2361DDDDF4D6A972A13',
                                url2: 'None',
                                url3: 'None',
                                url4: 'None',
                                url5: 'None',
                                correlationid:
                                    '5b0f44cf-11e2-4327-aedb-251110000001',
                            },
                        },
                        '5b0f44cf-11e2-4327-aedb-251110000002': {
                            fileRecordId:
                                '5b0f44cf-11e2-4327-aedb-251110000002',
                            recordStatus: 'EXISTING',
                            zlCaseId: 'CA0000547164',
                            fileRecordData: {
                                fileBatchId: '691198bc605eb478f470f07a',
                                source: 'OBT',
                                contractNumber: '680081631',
                                city: 'WHITEHOUSE STATION',
                                state: 'NJ',
                                account: '17688',
                                clientSSN: '822-14-3729',
                                clientLast: 'PITERSON',
                                clientFirst: 'PATRICK',
                                clientDOB: '01-02-1942',
                                group: 'SecureFore',
                                cu2: 'Male',
                                cu3: 'Active',
                                cu4: '903948230',
                                pbiLast: 'PITERSON',
                                pbiFirst: 'PATRICK',
                                pbiDOB: '01-02-1942',
                                pbiDOD: '09-09-2025',
                                pbiCity: 'WHITEHOUSE STATION',
                                pbiState: 'NJ',
                                url1: 'https://cloud.pbinfo.com/pbiresearch/obit/v2/43060937/A7C0FAB377C2F2361DDDDF4D6A972A13',
                                url2: 'None',
                                url3: 'None',
                                url4: 'None',
                                url5: 'None',
                                correlationid:
                                    '5b0f44cf-11e2-4327-aedb-251110000002',
                            },
                        },
                    },
                    exceptions: [],
                },
                {
                    fileProcessingStatus: 'UNPICKED',
                    fileName: '17688CertiDeath20251107UI011.txt',
                    inboundRecordId: 'e302ad6f-296a-451e-99f2-ac62aafeceb9',
                    inboundFileComplianceData: {
                        totalRecords: '2',
                        fileName: '17688CertiDeath20251107UI011.txt',
                        successfulRecords: '2',
                        failedRecords: '0',
                        correlationid: 'ce689797-0e08-4150-8ca6-016e9e316a13',
                        fileReceivedDate: '2025-11-10',
                    },
                    summary: {
                        totalRecordCount: 0,
                    },
                    fileRecords: {},
                    exceptions: [],
                },
                {
                    fileProcessingStatus: 'UNPICKED',
                    fileName: '17688_CertiDeath.20251107.UI011.txt.txt',
                    inboundRecordId: '81c0fca9-aef7-4c67-bd91-7ee870197bad',
                    inboundFileComplianceData: {
                        totalRecords: '2',
                        fileName: '17688_CertiDeath.20251107UI012.txt',
                        successfulRecords: '2',
                        failedRecords: '0',
                        correlationid: '5c231bb5-d60b-4766-90c9-2b2218a08045',
                        fileReceivedDate: '2025-11-10',
                    },
                    summary: {
                        totalRecordCount: 0,
                    },
                    fileRecords: {},
                    exceptions: [],
                },
            ],
            exceptions: [
                {
                    exceptionCause: 'INBOUND',
                    nmid: 'DC.EM.034',
                    exceptionId: '64f9c6c8-f279-49e7-985a-309e040106db',
                    exceptionStatus: 'RESOLVED',
                },
            ],
        },
    },
    createdTs: '2025-11-10T07:42:15.000Z',
    updatedTs: '2025-11-10T12:54:51.000Z',
    updatedBy: 'BPM.ClaimProcessing',
    identifiers: [
        {
            identifier: 'correlationId',
            value: '872f5376-f52b-433c-84e1-dd8f0abf22b3',
        },
        {
            identifier: 'client',
            value: 'FLIC',
        },
        {
            identifier: 'zlCaseId',
            value: 'CA0000547818',
        },
        {
            identifier: 'batchYearMonth',
            value: '202511',
        },
    ],
};

describe('##ComplianceDBUpdate', () => {
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

    it('#should render the no data message when no compliance db update data available', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: false, data: {} });
        render(
            <ComplianceDBUpdate stepAdditionalData={mockStepAdditionalData} />
        );

        expect(
            screen.getByText('complianceDBUpdate.noData')
        ).toBeInTheDocument();
    });

    it('#should render the no data message when compliance db update data is null', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: null,
        });
        render(
            <ComplianceDBUpdate stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText('complianceDBUpdate.noData')
        ).toBeInTheDocument();
    });

    it('#should render the loading message when compliance db update data is loading', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: true, data: {} });
        render(
            <ComplianceDBUpdate stepAdditionalData={mockStepAdditionalData} />
        );

        expect(
            screen.getByText('complianceDBUpdate.loadingTransactions')
        ).toBeInTheDocument();
    });

    it('#should render the compliance db files when compliance db update data available', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockComplianceDBUpdateData,
        });
        render(
            <ComplianceDBUpdate stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByTestId('compliance-db-update-title')
        ).toBeInTheDocument();
        expect(
            screen.getByText('complianceDBUpdate.details')
        ).toBeInTheDocument();

        expect(screen.getByTestId('compliance-db-files')).toBeInTheDocument();

        expect(
            screen.getByTestId('compliance-data-0-date')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('compliance-data-0-file-item')
        ).toBeInTheDocument();

        expect(
            screen.getByTestId('compliance-data-1-date')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('compliance-data-1-file-item')
        ).toBeInTheDocument();

        expect(
            screen.getByTestId('compliance-data-2-date')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('compliance-data-2-file-item')
        ).toBeInTheDocument();
    });

    it('#should render error message when error occurs during compliance db update data retrieval', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockComplianceDBUpdateData,
            isError: true,
        });
        render(
            <ComplianceDBUpdate stepAdditionalData={mockStepAdditionalData} />
        );
        expect(
            screen.getByText('complianceDBUpdate.errorGettingTransactions')
        ).toBeInTheDocument();
    });
});
