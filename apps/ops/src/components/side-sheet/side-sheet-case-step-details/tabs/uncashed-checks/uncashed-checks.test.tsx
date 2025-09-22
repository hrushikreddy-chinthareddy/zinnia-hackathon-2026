import { fireEvent, render, screen } from '@testing-library/react';
import { TFunction } from 'next-i18next';

import UncashedChecks, { UncashedTransaction } from './uncashed-checks';
import { UncashedTransactionStatus } from '../transactions-step-additional-data.types';

// Mock window.scroll
Object.defineProperty(window, 'scroll', {
    value: jest.fn(),
    writable: true,
});

const mockT: TFunction = (key: any) => key;

describe('UncashedChecks', () => {
    const mockTransaction1: UncashedTransaction = {
        id: '1',
        checkNumber: 'CHK001',
        checkIssueDate: '2023-01-15',
        transactionAmount: 1000,
        transactionDate: '2023-01-10',
        transactionNumber: 'TXN001',
        policyNumber: 'POL001',
        stopTransactionStatus: UncashedTransactionStatus.OUTSTANDING,
        postFund: false,
    };

    const mockTransaction2: UncashedTransaction = {
        id: '2',
        checkNumber: 'CHK002',
        checkIssueDate: '2023-02-20',
        transactionAmount: 2000,
        transactionDate: '2023-02-15',
        transactionNumber: 'TXN002',
        policyNumber: 'POL001',
        stopTransactionStatus: UncashedTransactionStatus.STOP,
        postFund: true,
    };

    const mockTransaction3: UncashedTransaction = {
        id: '3',
        checkNumber: 'CHK003',
        checkIssueDate: '2023-03-10',
        transactionAmount: 1500,
        transactionDate: '2023-03-05',
        transactionNumber: 'TXN003',
        policyNumber: 'POL002',
        stopTransactionStatus: UncashedTransactionStatus.SEND_CHECK_TO_ESTATE,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (window.scroll as jest.Mock).mockClear();
    });

    describe('#UncashedChecks component rendering', () => {
        it('#should render the component with correct container', () => {
            render(
                <UncashedChecks t={mockT} transactions={[mockTransaction1]} />
            );

            expect(
                screen.getByTestId('transactions-list-container')
            ).toBeInTheDocument();
        });

        it('#should render empty state when no transactions provided', () => {
            render(<UncashedChecks t={mockT} transactions={[]} />);
            expect(
                screen.getByText('transactionListing.noUncashedTransactions')
            ).toBeInTheDocument();
        });

        it('#should render empty state when transactions is null', () => {
            render(<UncashedChecks t={mockT} transactions={null as any} />);

            expect(
                screen.getByText('transactionListing.noUncashedTransactions')
            ).toBeInTheDocument();
        });

        it('#should render empty state when transactions is undefined', () => {
            render(
                <UncashedChecks t={mockT} transactions={undefined as any} />
            );

            expect(
                screen.getByText('transactionListing.noUncashedTransactions')
            ).toBeInTheDocument();
        });
    });

    describe('##Verify transactions listing', () => {
        it('#should group transactions by policy number', () => {
            const transactions = [
                mockTransaction1,
                mockTransaction2,
                mockTransaction3,
            ];
            render(<UncashedChecks t={mockT} transactions={transactions} />);

            expect(
                screen.getByTestId('contract-heading-POL001')
            ).toBeInTheDocument();
            expect(
                screen.getByTestId('contract-heading-POL002')
            ).toBeInTheDocument();
        });

        it('#should sort transactions by checkIssueDate in descending order', () => {
            const transactions = [mockTransaction1, mockTransaction2]; // Different dates
            render(<UncashedChecks t={mockT} transactions={transactions} />);

            const transactionCards = screen.getAllByTestId(
                'uncashed-transaction-card'
            );
            expect(transactionCards[0]).toHaveAttribute(
                'data-transaction-id',
                '2'
            );
            expect(transactionCards[1]).toHaveAttribute(
                'data-transaction-id',
                '1'
            );
        });

        it('#should handle transactions with missing policy number', () => {
            const transactionWithoutPolicy = {
                ...mockTransaction1,
                policyNumber: '',
            };
            render(
                <UncashedChecks
                    t={mockT}
                    transactions={[transactionWithoutPolicy]}
                />
            );

            expect(
                screen.getByTestId('contract-heading-Unknown')
            ).toBeInTheDocument();
        });
    });

    describe('##UncashedTransactionCard Integration', () => {
        it('#should render transaction cards for each transaction', () => {
            const transactions = [mockTransaction1, mockTransaction2];
            render(<UncashedChecks t={mockT} transactions={transactions} />);

            const transactionCards = screen.getAllByTestId(
                'uncashed-transaction-card'
            );
            expect(transactionCards).toHaveLength(2);
        });

        it('#should pass correct props to UncashedTransactionCard', () => {
            render(
                <UncashedChecks t={mockT} transactions={[mockTransaction1]} />
            );

            const transactionCard = screen.getByTestId(
                'uncashed-transaction-card'
            );
            expect(transactionCard).toBeInTheDocument();
            expect(transactionCard).toHaveAttribute('data-transaction-id', '1');
            expect(
                screen.getByTestId('trans-check-number-1')
            ).toBeInTheDocument();
            expect(
                screen.getByText('transactionListing.cardLabels.amount')
            ).toBeInTheDocument();
            expect(screen.getByTestId('trans-amount-1')).toBeInTheDocument();
            expect(
                screen.getByText('transactionListing.cardLabels.checkDate')
            ).toBeInTheDocument();
            expect(
                screen.getByTestId('trans-check-date-1')
            ).toBeInTheDocument();
        });
    });

    describe('##Verify pagination Functionality', () => {
        const createManyTransactions = (
            count: number,
            policyNumber: string = 'POL001'
        ) => {
            return Array.from({ length: count }, (_, index) => ({
                ...mockTransaction1,
                id: `${index + 1}`,
                checkNumber: `CHK${String(index + 1).padStart(3, '0')}`,
                checkIssueDate: `2023-01-${String(index + 1).padStart(2, '0')}`,
                policyNumber,
            }));
        };

        it('#should not show pagination when transactions are less than or equal to limit', () => {
            const transactions = createManyTransactions(10);
            render(<UncashedChecks t={mockT} transactions={transactions} />);

            expect(
                screen.queryByTestId('trans-pagination')
            ).not.toBeInTheDocument();
        });

        it('#should show pagination when transactions exceed limit', () => {
            const transactions = createManyTransactions(15);
            render(<UncashedChecks t={mockT} transactions={transactions} />);

            expect(screen.getByTestId('trans-pagination')).toBeInTheDocument();
        });

        it('#should handle pagination link click', () => {
            const transactions = createManyTransactions(15);
            render(<UncashedChecks t={mockT} transactions={transactions} />);

            // Before clicking, page 1 should render 5 cards
            const transactionCardBefore = screen.getAllByTestId(
                'uncashed-transaction-card'
            );
            expect(transactionCardBefore.length).toBe(10);

            // Simulate clicking page 2 if Pagination renders page buttons with text '2'
            const button = screen.getByRole('button', {
                name: /page 2/i,
            });
            fireEvent.click(button);
            // After clicking, page 2 should render 5 cards
            const transactionCardAfter = screen.getAllByTestId(
                'uncashed-transaction-card'
            );
            expect(transactionCardAfter.length).toBe(5);
        });
    });
});
