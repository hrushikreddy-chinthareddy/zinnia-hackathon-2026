import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

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

jest.mock('@zinnia/bloom/components', () => ({
    Label: ({
        children,
        labelFor,
        ...props
    }: {
        children?: React.ReactNode;
        labelFor?: string;
    }) => (
        <label htmlFor={labelFor} {...props}>
            {children}
        </label>
    ),
    Toggle: ({
        labelId,
        text,
        pressed,
        onClick,
    }: {
        labelId: string;
        text: string;
        pressed: boolean;
        onClick: () => void;
    }) => (
        <button
            type="button"
            aria-pressed={pressed}
            id={labelId}
            onClick={onClick}
        >
            {text}
        </button>
    ),
    FieldDateRange: ({
        defaultStartDate,
        defaultEndDate,
        onApply: _onApply,
        label,
    }: {
        defaultStartDate: string;
        defaultEndDate: string;
        onApply: (start: string, end: string) => void;
        label: React.ReactNode;
    }) => (
        <div data-testid="field-date-range">
            {label}
            <span>{defaultStartDate}</span>
            <span>{defaultEndDate}</span>
        </div>
    ),
    SelectFilter: ({
        onValueChange,
        options,
        values,
        placeHolder,
    }: {
        onValueChange: (value: string[]) => void;
        options: Array<{ value: string; label: string }>;
        values: string[];
        placeHolder: string;
    }) => (
        <div data-testid="select-filter">
            <span>{placeHolder}</span>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                        onValueChange(
                            values.includes(opt.value)
                                ? values.filter((v) => v !== opt.value)
                                : [...values, opt.value]
                        )
                    }
                >
                    {opt.label}
                </button>
            ))}
        </div>
    ),
    TabGroup: ({
        defaultValue: _defaultValue,
        value: _value,
        onValueChange: _onValueChange,
        children,
        className,
    }: {
        defaultValue: string;
        value: string;
        onValueChange: (tab: string) => void;
        children: React.ReactNode;
        className?: string;
    }) => (
        <div data-testid="tab-group" className={className}>
            {children}
        </div>
    ),
    TabList: ({ children }: { children: React.ReactNode }) => (
        <div role="tablist" data-testid="tab-list">
            {children}
        </div>
    ),
    TabTrigger: ({
        children,
        value,
    }: {
        children: React.ReactNode;
        value: string;
    }) => (
        <button
            type="button"
            role="tab"
            data-value={value}
            data-testid={`tab-trigger-${value}`}
        >
            {children}
        </button>
    ),
    Table: ({ children }: { children: React.ReactNode }) => (
        <table>{children}</table>
    ),
    TableBody: ({ children }: { children: React.ReactNode }) => (
        <tbody>{children}</tbody>
    ),
    TableCell: ({ children }: { children: React.ReactNode }) => (
        <td>{children}</td>
    ),
    TableHeader: ({ children }: { children: React.ReactNode }) => (
        <thead>{children}</thead>
    ),
    TableHeaderCell: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => <th className={className}>{children}</th>,
    TableRow: ({
        children,
        onClick,
        tabIndex,
        onKeyDown,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        tabIndex?: number;
        onKeyDown?: (e: React.KeyboardEvent) => void;
    }) => (
        <tr onClick={onClick} tabIndex={tabIndex} onKeyDown={onKeyDown}>
            {children}
        </tr>
    ),
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

    it('filters out InterestCredit transactions when the toggle is pressed', () => {
        renderComponent();
        const table = screen.getByRole('table');

        // Both transaction types should be visible in the table initially
        expect(
            within(table).getByText(`enums.${INTEREST_CREDIT_TYPE}`)
        ).toBeInTheDocument();
        expect(
            within(table).getByText(
                `enums.${TransactionTypeEnum.SUBSEQUENT_PREMIUM}`
            )
        ).toBeInTheDocument();

        // Press the toggle
        const toggle = screen.getByRole('button', {
            name: 'allFields.hideDailyInterest',
        });
        fireEvent.click(toggle);

        // InterestCredit should be filtered out from the table
        expect(
            within(table).queryByText(`enums.${INTEREST_CREDIT_TYPE}`)
        ).not.toBeInTheDocument();
        // Other transactions remain
        expect(
            within(table).getByText(
                `enums.${TransactionTypeEnum.SUBSEQUENT_PREMIUM}`
            )
        ).toBeInTheDocument();
    });

    it('shows all transactions again when the toggle is turned off', () => {
        renderComponent();
        const table = screen.getByRole('table');
        const toggle = screen.getByRole('button', {
            name: 'allFields.hideDailyInterest',
        });

        // Toggle on
        fireEvent.click(toggle);
        expect(
            within(table).queryByText(`enums.${INTEREST_CREDIT_TYPE}`)
        ).not.toBeInTheDocument();

        // Toggle off
        fireEvent.click(toggle);
        expect(
            within(table).getByText(`enums.${INTEREST_CREDIT_TYPE}`)
        ).toBeInTheDocument();
    });
});
