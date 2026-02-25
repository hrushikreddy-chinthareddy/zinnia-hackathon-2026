import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    HistoryFiltersContext,
    HistoryFilters,
    initialFilter,
} from '@deps/contexts/HistoryFiltersContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useTransactions } from '@deps/hooks/useTransactions';
import { TransactionSummary } from '@deps/types/transactions';
import {
    Policy,
    TransactionStatus,
    TransactionTypeEnum,
} from '@zinnia/api-types/types/sor';

import { TransactionsWrapper } from './transactions-wrapper';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@deps/hooks/useTransactions', () => ({
    initialFilterTransactions: {
        Completed: [],
        Pending: [],
        Canceled: [],
        Failed: [],
        Reversed: [],
    },
    useTransactions: jest.fn(),
}));

jest.mock('@deps/utils/server-logging');

const INTEREST_CREDIT_TYPE = TransactionTypeEnum.INTEREST_CREDIT;

/** Helper to build a minimal TransactionSummary */
const buildTransaction = (
    overrides: Partial<TransactionSummary> = {}
): TransactionSummary => ({
    transactionId: `txn-${Math.random()}`,
    policyNumber: 'POL123',
    status: TransactionStatus.COMPLETED,
    transactionType: TransactionTypeEnum.SUBSEQUENT_PREMIUM,
    effectiveDate: '2024-01-15',
    processDate: '2024-01-15',
    requestDate: '2024-01-10',
    ...overrides,
});

const interestCreditTxn = buildTransaction({
    transactionType: INTEREST_CREDIT_TYPE,
    transactionId: 'txn-interest',
});

const premiumTxn = buildTransaction({
    transactionType: TransactionTypeEnum.SUBSEQUENT_PREMIUM,
    transactionId: 'txn-premium',
});

const mockPolicy = {
    policyNumber: 'POL123',
    product: { planCode: 'PLAN1' },
} as Policy;

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

interface RenderOptions {
    historyFilters?: HistoryFilters;
    setHistoryFilters?: jest.Mock;
    transactions?: Record<string, TransactionSummary[]>;
}

/**
 * Renders TransactionsWrapper with the required providers.
 * Allows overriding historyFilters and the mock transaction data.
 */
const renderComponent = ({
    historyFilters = initialFilter,
    setHistoryFilters = jest.fn(),
    transactions,
}: RenderOptions = {}) => {
    const mockTransactions = transactions ?? {
        [TransactionStatus.COMPLETED]: [interestCreditTxn, premiumTxn],
        [TransactionStatus.PENDING]: [],
        [TransactionStatus.CANCELED]: [],
        [TransactionStatus.FAILED]: [],
        [TransactionStatus.REVERSED]: [],
    };

    (useTransactions as jest.Mock).mockReturnValue({
        data: mockTransactions,
        isLoading: false,
        refetch: jest.fn(),
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <PolicyData.Provider
                value={{
                    policy: mockPolicy,
                    policyDetails: new PolicyDetails(mockPolicy),
                    refreshPolicy: () => null,
                }}
            >
                <HistoryFiltersContext.Provider
                    value={{ historyFilters, setHistoryFilters }}
                >
                    <TransactionsWrapper />
                </HistoryFiltersContext.Provider>
            </PolicyData.Provider>
        </QueryClientProvider>
    );
};

describe('TransactionsWrapper – Hide daily interest toggle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows the toggle when the Completed tab is selected', () => {
        renderComponent();

        expect(
            screen.getByText('allFields.hideDailyInterest')
        ).toBeInTheDocument();
    });

    it('hides the toggle when a non-Completed tab is selected', () => {
        renderComponent({
            historyFilters: {
                statusFilter: TransactionStatus.PENDING,
            },
        });

        expect(
            screen.queryByText('allFields.hideDailyInterest')
        ).not.toBeInTheDocument();
    });

    it('filters out InterestCredit transactions when the toggle is pressed', () => {
        renderComponent();

        // Both transaction types should be visible initially
        expect(
            screen.getByText(`enums.${INTEREST_CREDIT_TYPE}`)
        ).toBeInTheDocument();
        expect(
            screen.getByText(`enums.${TransactionTypeEnum.SUBSEQUENT_PREMIUM}`)
        ).toBeInTheDocument();

        // Press the toggle
        const toggle = screen.getByRole('button', {
            name: 'allFields.hideDailyInterest',
        });
        fireEvent.click(toggle);

        // InterestCredit should be filtered out
        expect(
            screen.queryByText(`enums.${INTEREST_CREDIT_TYPE}`)
        ).not.toBeInTheDocument();
        // Other transactions remain
        expect(
            screen.getByText(`enums.${TransactionTypeEnum.SUBSEQUENT_PREMIUM}`)
        ).toBeInTheDocument();
    });

    it('shows all transactions again when the toggle is turned off', () => {
        renderComponent();

        const toggle = screen.getByRole('button', {
            name: 'allFields.hideDailyInterest',
        });

        // Toggle on
        fireEvent.click(toggle);
        expect(
            screen.queryByText(`enums.${INTEREST_CREDIT_TYPE}`)
        ).not.toBeInTheDocument();

        // Toggle off
        fireEvent.click(toggle);
        expect(
            screen.getByText(`enums.${INTEREST_CREDIT_TYPE}`)
        ).toBeInTheDocument();
    });
});
