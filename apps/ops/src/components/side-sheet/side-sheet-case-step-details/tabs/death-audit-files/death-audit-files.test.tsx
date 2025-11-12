import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';

import DeathAuditFiles from './death-audit-files';
import { DeathAuditFileTypes } from './death-audit-files.types';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}));

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('@optimizely/optimizely-sdk', () => ({
    createInstance: jest.fn(),
}));

const mockStepAdditionalData: CaseAdditionalStepData = {
    id: 'd3453bc6-a9c7-4543-a721-93b166dd5588',
    label: 'PaymentRecordId',
    value: 'd3453bc6-a9c7-4543-a721-93b166dd5588',
    dataType: 'OBJECT',
    entityType: 'IDN_CLAIM_AUDIT_BATCH_RECORD',
    source: 'ENTITY',
};

const mockDeathAuditFilesData = {
    correlationId: 'c7b391db-4654-4591-81ca-33e83340d767',
    recordId: 'd3453bc6-a9c7-4543-a721-93b166dd5588',
    transactionType: 'CLAIM',
    carrier: 'FLIC',
    source: 'BPM.ClaimProcessing',
    entityType: 'IDN_CLAIM_AUDIT_BATCH_RECORD',
    entity: {
        auditBatchSchedule: {
            businessKey: null,
            clientCode: 'FLIC',
            batchYearMonth: '202510',
            startDateTime: '2025-10-28T10:37:23.692814Z',
            endDateTime: '2025-10-31T23:59:59Z',
            outboundSlaDateTime: '2025-10-28T10:39:42.138Z',
            inboundSlaDateTime: '2025-10-28T10:39:42.138Z',
        },
        recordId: 'd3453bc6-a9c7-4543-a721-93b166dd5588',
        recordType: 'IDN_CLAIM_AUDIT_BATCH_RECORD',
        businessKey: 'FLIC-202510',
        processInstanceId: '1712ea6f-b3ea-11f0-9925-12adddc874a5',
        carrier: 'FLIC',
        startDate: '2025-10-28T10:37:23.692814Z',
        batchYearMonth: '202510',
        caseId: 'CA0000539888',
        status: 'NIGO',
        outbound: {
            files: [],
        },
        inbound: {
            summary: {
                totalRecordCount: 1,
                cancelledRecordCount: 1,
                existingCaseCount: 0,
                newCaseCount: 0,
            },
            files: [
                {
                    fileProcessingStatus: 'PROCESSED',
                    inboundRecordId: 'fb567201-842a-4581-bdf6-7deb5115a488',
                    inboundFileData: {
                        totalRecords: '1',
                        fileName: '17688_CertiDeath.20251028.060029.010999.txt',
                        successfulRecords: '1',
                        failedRecords: '0',
                        correlationid: '003e1d7f-37df-426b-b166-adb16fe8bc31',
                        fileBatchId: '69009d017b233d4f6122d311',
                        fileReceivedDate: '2025-10-28',
                        documentId: '69009d017b233d4f6122d311',
                        ChildEventEndId: 'be57e51e-fa49-4804-b153-251028000001',
                        ChildEventStartId:
                            'be57e51e-fa49-4804-b153-251028000001',
                    },
                    inboundCasesFile: {
                        documentId: '69009d017b233d4f6122d311',
                        fileName: '17688_CertiDeath.20251028.060029.010999.txt',
                        fileRecordCount: 1,
                        receivedTimestamp: '2025-10-28T10:37:55.213Z',
                    },
                    cancelledCasesFile: {
                        documentId: '69009d0753ccd75e6daa5e20',
                        fileName: 'CancelFile.csv',
                        fileRecordCount: 1,
                        createdTimestamp: '2025-10-28T10:37:59.735Z',
                    },
                    summary: {
                        totalRecordCount: 1,
                        cancelledRecordCount: 1,
                    },
                    fileRecords: {
                        'be57e51e-fa49-4804-b153-251028000001': {
                            fileRecordId:
                                'be57e51e-fa49-4804-b153-251028000001',
                            recordStatus: 'CANCEL',
                            zlCaseId: 'CA0000537844',
                            fileRecordData: {
                                fileBatchId: '69009d017b233d4f6122d311',
                                source: 'OBT',
                                contractNumber: '551001680',
                                city: 'WHITEHOUSE STATION',
                                state: 'NJ',
                                account: '17688',
                                clientSSN: '543-58-5592',
                                clientLast: 'DELAROSA',
                                clientFirst: 'TRISH',
                                clientDOB: '03-02-1982',
                                group: 'SecureFore',
                                cu2: 'Male',
                                cu3: 'Death Claim Pen',
                                cu4: '903948230',
                                pbiLast: 'DELAROSA',
                                pbiFirst: 'TRISH',
                                pbiDOB: '03-02-1982',
                                pbiDOD: '10-08-2025',
                                pbiCity: 'WHITEHOUSE STATION',
                                pbiState: 'NJ',
                                url1: 'https://cloud.pbinfo.com/pbiresearch/obit/v2/43060937/A7C0FAB377C2F2361DDDDF4D6A972A13',
                                url2: 'None',
                                url3: 'None',
                                url4: 'None',
                                url5: 'None',
                                correlationid:
                                    'be57e51e-fa49-4804-b153-251028000001',
                            },
                        },
                    },
                },
            ],
        },
    },
    createdTs: '2025-10-28T10:37:24.000Z',
    updatedTs: '2025-10-28T10:44:57.000Z',
    updatedBy: 'BPM.ClaimProcessing',
    identifiers: [
        {
            identifier: 'correlationId',
            value: 'c7b391db-4654-4591-81ca-33e83340d767',
        },
        {
            identifier: 'client',
            value: 'FLIC',
        },
        {
            identifier: 'zlCaseId',
            value: 'CA0000539888',
        },
        {
            identifier: 'batchYearMonth',
            value: '202510',
        },
    ],
};

describe('##DeathAuditFiles', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    it('#should render the loading message when data is loading', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: true,
            data: {},
        });
        render(
            <DeathAuditFiles
                stepAdditionalData={mockStepAdditionalData}
                prop={DeathAuditFileTypes.OUTBOUND}
                title={'deathAuditFiles.details'}
            />
        );

        expect(
            screen.getByText('deathAuditFiles.loadingTransactions')
        ).toBeInTheDocument();
    });

    it('#should render the error message in case of error', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockDeathAuditFilesData,
            isError: true,
        });
        render(
            <DeathAuditFiles
                stepAdditionalData={mockStepAdditionalData}
                prop={DeathAuditFileTypes.OUTBOUND}
                title={'deathAuditFiles.details'}
            />
        );

        expect(
            screen.getByText('deathAuditFiles.errorGettingTransactions')
        ).toBeInTheDocument();
    });

    it('#should render the component for OUTBOUND files', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockDeathAuditFilesData,
        });
        render(
            <DeathAuditFiles
                stepAdditionalData={mockStepAdditionalData}
                prop={DeathAuditFileTypes.OUTBOUND}
                title={'deathAuditFiles.details'}
            />
        );

        expect(screen.getByText('deathAuditFiles.details')).toBeInTheDocument();
        expect(
            screen.getByText('deathAuditFiles.summary.totalRecordsSent')
        ).toBeInTheDocument();
    });
});
