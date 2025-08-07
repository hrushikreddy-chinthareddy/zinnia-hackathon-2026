import { fireEvent, render, screen } from '@testing-library/react';
import { TFunction } from 'next-i18next';

import TransactionsTable from './transactions-table';

const mockT: TFunction = (key: any) => key;

const transactionsMock = [
    {
        arrangementId: '986010',
        arrangementType: 'Sys Partial Wthdrwl (Gross)',
        amountType: '4',
        amount: 1000,
        terminateDate: '2025-08-03T09:00:00',
        action: 'DELETE',
        actionStatus: 'SUCCESS',
    },
    {
        arrangementId: '986012',
        arrangementType: 'Sys Partial Wthdrwl (Net)',
        amountType: '4',
        amount: 101,
        terminateDate: '2025-08-04T09:00:00',
        action: 'TERMINATE',
        actionStatus: 'SUCCESS',
    },
];

const failTransactionsMock = [
    {
        arrangementId: '986010',
        arrangementType: 'Sys Partial Wthdrwl (Gross)',
        amountType: '4',
        amount: 1000,
        terminateDate: '2025-08-05T09:00:00',
        action: 'DELETE',
        actionStatus: 'FAIL',
    },
    {
        arrangementId: '986012',
        arrangementType: 'Sys Partial Wthdrwl (Net)',
        amountType: '4',
        amount: 101,
        terminateDate: '2025-08-06T09:00:00',
        action: 'TERMINATE',
        actionStatus: 'FAIL',
    },
];

describe('##TransactionsTable', () => {
    it('#renders table headers', () => {
        render(<TransactionsTable t={mockT} transactions={transactionsMock} />);
        expect(
            screen.getByText('transactionListing.tableColumns.transaction')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.tableColumns.status')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.tableColumns.amount')
        ).toBeInTheDocument();
    });

    it('#renders transaction rows with success actions status', () => {
        render(<TransactionsTable t={mockT} transactions={transactionsMock} />);
        expect(
            screen.getByText('Sys partial wthdrwl (gross)')
        ).toBeInTheDocument();
        expect(screen.getByText('986010')).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.deleted')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.on August 3, 2025')
        ).toBeInTheDocument();
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();

        expect(
            screen.getByText('Sys partial wthdrwl (net)')
        ).toBeInTheDocument();
        expect(screen.getByText('986012')).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.terminated')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.on August 4, 2025')
        ).toBeInTheDocument();
        expect(screen.getByText('$101.00')).toBeInTheDocument();
    });

    it('#renders transaction rows with fail actions status', () => {
        render(
            <TransactionsTable t={mockT} transactions={failTransactionsMock} />
        );
        expect(
            screen.getByText('Sys partial wthdrwl (gross)')
        ).toBeInTheDocument();
        expect(screen.getByText('986010')).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.deleteFailed')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.on August 5, 2025')
        ).toBeInTheDocument();
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();

        expect(
            screen.getByText('Sys partial wthdrwl (net)')
        ).toBeInTheDocument();
        expect(screen.getByText('986012')).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.terminateFailed')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.on August 6, 2025')
        ).toBeInTheDocument();
        expect(screen.getByText('$101.00')).toBeInTheDocument();
    });

    it('#renders pagination when transactions exceed limit', () => {
        const manyTransactions = Array.from({ length: 12 }, (_, i) => {
            const id = i + 1;
            return {
                arrangementId: id.toString(),
                arrangementType: 'Sys Partial Wthdrwl (Net)',
                amountType: '4',
                amount: 100 + i,
                terminateDate: '2025-08-04T09:00:00',
                action: 'TERMINATE',
                actionStatus: 'SUCCESS',
            };
        });
        render(<TransactionsTable t={mockT} transactions={manyTransactions} />);
        expect(
            screen.getByTestId('transactions-list-container')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.tableColumns.transaction')
        ).toBeInTheDocument();
        // Pagination should be rendered
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('#calls goToPage and updates offset on pagination', () => {
        const manyTransactions = Array.from({ length: 12 }, (_, i) => {
            const id = i + 1;
            return {
                arrangementId: id.toString(),
                arrangementType: 'Sys Partial Wthdrwl (Net)',
                amountType: '4',
                amount: 100 + i,
                terminateDate: '2025-08-04T09:00:00',
                action: 'TERMINATE',
                actionStatus: 'SUCCESS',
            };
        });
        render(<TransactionsTable t={mockT} transactions={manyTransactions} />);

        jest.spyOn(console, 'error').mockImplementation();
        // Simulate clicking page 2 if Pagination renders page buttons with text '2'
        const button = screen.getByRole('button', {
            name: /page 2/i,
        });
        fireEvent.click(button);
        // After clicking, the first transaction on page 2 should be rendered
        expect(screen.getByText('11')).toBeInTheDocument();
    });

    it('#renders empty state when transactions is undefined', () => {
        render(<TransactionsTable t={mockT} transactions={undefined} />);
        expect(
            screen.getByTestId('transactions-list-container')
        ).toBeInTheDocument();
        // No rows should be rendered
        expect(screen.queryByText('Loan')).not.toBeInTheDocument();
    });
});
