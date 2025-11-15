import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import { toSentenceCase } from '@deps/helpers/string.helpers';
import { PartyRole, PartyType } from '@deps/models/policy/sor-policy';

import { TransactionsStepAdditionalData } from './transactions-step-additional-data';
import {
    TransactionActions,
    TransactionActionStatuses,
    TransactionsAdditionalDataStepIds,
    UncashedTransactionStatus,
} from './transactions-step-additional-data.types';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}));

jest.mock('@optimizely/optimizely-sdk', () => ({
    createInstance: jest.fn(() => ({
        // mock methods as needed
    })),
}));

const mockStepAdditionalData = {
    id: 'e9f0b68e-bd31-4879-a773-a40fbb5ed0c8',
    label: 'PaymentRecordId',
    value: 'e9f0b68e-bd31-4879-a773-a40fbb5ed0c8',
    dataType: 'STOP_SSW',
    entityType: 'IDN_CLAIM_RECORD',
    source: 'ENTITY',
};

const mockProgramResponse = {
    correlationId: 'eec7612a-f947-4ebb-99a1-de4b87491d95',
    recordId: '3a7ae528-b797-462a-8249-ad3caf26667f',
    transactionType: 'CLAIM',
    carrier: 'FLIC',
    source: 'BPM.ClaimProcessing',
    entityType: 'IDN_CLAIM_RECORD',
    entity: {
        recordId: '3a7ae528-b797-462a-8249-ad3caf26667f',
        recordType: 'IDN_CLAIM_RECORD',
        status: 'INPROGRESS',
        contractNumber: '551007004',
        onbaseClaimCaseId: '12406136',
        deceasedParties: [
            {
                partyRole: PartyRole.ANNUITANT,
                partyType: PartyType.INDIVIDUAL,
                deceasedName: 'PATRICK PITERSON',
                dateOfDeceased: '2025-09-10',
                dateOfNotification: '2025-09-11',
                isDeceased: true,
            },
        ],
        stopPrograms: {
            systematicPrograms: [
                {
                    arrangementId: '985465',
                    arrangementType: 'Sys Partial Wthdrwl (Gross)',
                    amountType: '4',
                    amount: 101,
                    terminateDate: '2025-09-11',
                    action: TransactionActions.TERMINATE,
                    actionStatus: TransactionActionStatuses.SUCCESS,
                },
                {
                    arrangementId: '985467',
                    arrangementType: 'Sys Partial Wthdrwl (Net)',
                    amountType: '4',
                    amount: 101,
                    terminateDate: '2025-09-11',
                    action: TransactionActions.TERMINATE,
                    actionStatus: TransactionActionStatuses.SUCCESS,
                },
            ],
            specialPrograms: [
                {
                    arrangementId: '985463',
                    arrangementType: 'Annuity Payment Defaults',
                    amountType: '0',
                    amount: 0,
                    terminateDate: '2025-09-11',
                    action: TransactionActions.TERMINATE,
                    actionStatus: TransactionActionStatuses.SUCCESS,
                },
                {
                    arrangementId: '985464',
                    arrangementType: 'Charge Deduction',
                    amountType: '0',
                    amount: 0,
                    terminateDate: '2025-09-11',
                    action: TransactionActions.TERMINATE,
                    actionStatus: TransactionActionStatuses.SUCCESS,
                },
            ],
            rmdPrograms: [
                {
                    arrangementId: '985466',
                    arrangementType: 'Min Required Distribution',
                    amountType: '4',
                    amount: 101,
                    terminateDate: '2025-09-11',
                    action: TransactionActions.TERMINATE,
                    actionStatus: TransactionActionStatuses.SUCCESS,
                },
            ],
        },
        stopTransactions: {
            uncashTransactionIdentified: true,
            uncashTransactionExists: true,
            transactions: [
                {
                    id: '2912c073-b748-4512-96e8-a403f818de38',
                    policyNumber: '551007004',
                    transactionDate: '2025-07-18',
                    transactionAmount: '90.9',
                    checkNumber: '00864216',
                    checkIssueDate: '2025-07-16',
                    checkStopDate: '2025-09-11',
                    postFund: false,
                    stopTransactionStatus: UncashedTransactionStatus.STOP,
                    paymentRefId: '8200330366',
                    paymentMethod: 'CHK',
                    paymentStatus: 'P',
                    paymentDate: '2025-07-18',
                    bankCode: 'UMB01',
                    bankAccountkey: '3573',
                    bankReconcileStatus: 'UNR',
                    sourceData: {
                        setId: 'E2FT1',
                        paymentRefId: '8200330366',
                        paymentMethod: 'CHK',
                        rolledUpPayment: 'Y',
                        paymentDate: '2025-07-18',
                        glBusinessUnit: '820',
                        paymentStatus: 'P',
                        actionRequestStatus: 'UNR',
                        bankAccountkey: '3573',
                        bankCode: 'UMB01',
                        Details: [
                            {
                                contractNumber: '551007004',
                                voucherAmount: '90.9',
                                voucherId: '00864216',
                                invoiceDate: '2025-07-16',
                                apBusinessUnit: '82000',
                            },
                            {
                                contractNumber: '551007004',
                                voucherAmount: '101',
                                voucherId: '00864217',
                                invoiceDate: '2025-07-16',
                                apBusinessUnit: '82000',
                            },
                        ],
                    },
                    identifiedManually: false,
                    stopManually: false,
                },
                {
                    id: 'f55efc29-f7ac-4ea2-b42a-08aba694707b',
                    policyNumber: '551007004',
                    transactionDate: '2025-07-18',
                    transactionAmount: '101',
                    checkNumber: '00864217',
                    checkIssueDate: '2025-07-16',
                    checkStopDate: '2025-09-11',
                    postFund: false,
                    stopTransactionStatus: UncashedTransactionStatus.STOP,
                    paymentRefId: '8200330366',
                    paymentMethod: 'CHK',
                    paymentStatus: 'P',
                    paymentDate: '2025-07-18',
                    bankCode: 'UMB01',
                    bankAccountkey: '3573',
                    bankReconcileStatus: 'UNR',
                    sourceData: {
                        setId: 'E2FT1',
                        paymentRefId: '8200330366',
                        paymentMethod: 'CHK',
                        rolledUpPayment: 'Y',
                        paymentDate: '2025-07-18',
                        glBusinessUnit: '820',
                        paymentStatus: 'P',
                        actionRequestStatus: 'UNR',
                        bankAccountkey: '3573',
                        bankCode: 'UMB01',
                        Details: [
                            {
                                contractNumber: '551007004',
                                voucherAmount: '90.9',
                                voucherId: '00864216',
                                invoiceDate: '2025-07-16',
                                apBusinessUnit: '82000',
                            },
                            {
                                contractNumber: '551007004',
                                voucherAmount: '101',
                                voucherId: '00864217',
                                invoiceDate: '2025-07-16',
                                apBusinessUnit: '82000',
                            },
                        ],
                    },
                    identifiedManually: false,
                    stopManually: false,
                },
            ],
        },
    },
    createdTs: '2025-09-11T09:50:22.000Z',
    updatedTs: '2025-09-11T09:53:05.000Z',
    identifiers: [
        {
            identifier: 'policyNumber',
            value: '551007004',
        },
        {
            identifier: 'zlCaseId',
            value: 'CA0000486697',
        },
    ],
};

describe('##TransactionsStepAdditionalData', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        consoleWarnSpy = jest
            .spyOn(console, 'warn')
            .mockImplementation(() => {});
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    afterEach(() => {
        consoleErrorSpy.mockClear();
        consoleWarnSpy.mockClear();
    });

    it('#should render the error message when error occurred while fetching programs', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: {},
            isError: true,
        });
        render(
            <TransactionsStepAdditionalData
                stepAdditionalData={mockStepAdditionalData}
                stepKey={
                    TransactionsAdditionalDataStepIds.stopSystematicPrograms
                }
            />
        );
        expect(
            screen.getByText('transactionListing.errorGettingTransactions')
        ).toBeInTheDocument();
    });

    it('#should render the loading message when programs are getting fetched', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: true, data: {} });
        render(
            <TransactionsStepAdditionalData
                stepAdditionalData={mockStepAdditionalData}
                stepKey={
                    TransactionsAdditionalDataStepIds.stopSystematicPrograms
                }
            />
        );
        expect(
            screen.getByText('transactionListing.loadingTransactions')
        ).toBeInTheDocument();
    });

    it('#should render the no transactions found message when no systematic program transactions available', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: false, data: {} });
        render(
            <TransactionsStepAdditionalData
                stepAdditionalData={mockStepAdditionalData}
                stepKey={
                    TransactionsAdditionalDataStepIds.stopSystematicPrograms
                }
            />
        );
        expect(
            screen.getByText('transactionListing.stoppedTransactions')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.noTransactionsFoundTitle')
        ).toBeInTheDocument();
    });

    it('#should render the transactions when systematic program transactions available', () => {
        (useQuery as jest.Mock).mockReturnValue({
            isLoading: false,
            data: mockProgramResponse,
        });
        render(
            <TransactionsStepAdditionalData
                stepAdditionalData={mockStepAdditionalData}
                stepKey={
                    TransactionsAdditionalDataStepIds.stopSystematicPrograms
                }
            />
        );

        expect(
            screen.getByTestId('view-transactions-section')
        ).toBeInTheDocument();

        expect(
            screen.getByText('transactionListing.tableColumns.transaction')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.tableColumns.status')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.tableColumns.amount')
        ).toBeInTheDocument();

        const { systematicPrograms } = mockProgramResponse.entity.stopPrograms;
        systematicPrograms.forEach((program, index) => {
            expect(
                screen.getByText(toSentenceCase(program.arrangementType))
            ).toBeInTheDocument();
            expect(
                screen.getByText(toSentenceCase(program.arrangementId))
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`task-${program.arrangementId}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`task-arrangement-id-${index}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`task-arrangement-type-${index}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`task-arrangement-status-${index}`)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(`task-arrangement-terminate-date-${index}`)
            ).toBeInTheDocument();
        });
    });

    it('#should render nothing when non existing step key is passed', () => {
        (useQuery as jest.Mock).mockReturnValue({ isLoading: false, data: {} });
        render(
            <TransactionsStepAdditionalData
                stepAdditionalData={mockStepAdditionalData}
                stepKey={'test' as TransactionsAdditionalDataStepIds}
            />
        );
        expect(screen.queryByText('Uncashed Checks')).not.toBeInTheDocument();
    });
});
