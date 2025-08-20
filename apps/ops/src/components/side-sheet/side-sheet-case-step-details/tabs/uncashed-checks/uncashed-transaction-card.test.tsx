import { render, screen } from '@testing-library/react';
import { TFunction } from 'next-i18next';

import { UncashedTransactionStatus } from '../transactions-step-additional-data.types';
import { UncashedTransaction } from './uncashed-checks';
import UncashedTransactionCard from './uncashed-transaction-card';

const mockT: TFunction = (key: any) => key;

const mockTransaction: UncashedTransaction = {
    id: 'fcdb40df-7438-410d-acea-dd7402991b13',
    checkNumber: '00862429',
    checkIssueDate: '2023-12-15',
    transactionAmount: 1500.5,
    transactionDate: '2023-12-10',
    transactionNumber: 'TXN001',
    policyNumber: 'POL123456',
    stopTransactionStatus: UncashedTransactionStatus.OUTSTANDING,
    postFund: false,
};

describe('##UncashedTransactionCard', () => {
    it('#should renders the UncashedTransactionCard component correctly', () => {
        render(
            <UncashedTransactionCard t={mockT} transaction={mockTransaction} />
        );

        expect(
            screen.getByText('transactionListing.cardLabels.check')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(`trans-check-number-${mockTransaction.id}`)
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.cardLabels.amount')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(`trans-amount-${mockTransaction.id}`)
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.cardLabels.checkDate')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(`trans-check-date-${mockTransaction.id}`)
        ).toBeInTheDocument();

        expect(
            screen.getByText('transactionListing.labels.outstanding')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.stopped')
        ).toBeInTheDocument();
        expect(
            screen.getByText('transactionListing.labels.checkToEstate')
        ).toBeInTheDocument();
    });
});
