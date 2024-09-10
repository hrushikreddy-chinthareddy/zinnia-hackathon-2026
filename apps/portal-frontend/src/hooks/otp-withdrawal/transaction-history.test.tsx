import { renderHook, waitFor } from '@testing-library/react';

import { TransactionStatus } from '@deps/models/case/withdrawal/case';
import * as Policies from '@deps/queries/api/policies';

import { TransactionType, TypeDesc, useTransactionsHistory } from './transaction-history';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: jest.fn((key: string, options?: Record<string, string>) => {
            if (options) return `${key} ${Object.values(options).join(' ')}`;
            return key;
        }),
    }),
}));
jest.mock('@deps/utils/server-logging');
jest.mock('@deps/queries/api/policies');
const mockedTransactionsHistory = jest.mocked(Policies.getPolicyTransactionHistory);
describe('Transaction history component', () => {
    it('should handle null data response without throwing errors', async () => {
        mockedTransactionsHistory.mockResolvedValue(Promise.resolve(null));
        const { result } = renderHook(() =>
            useTransactionsHistory({
                contract: '680160004',
                clientId: 'FLIC',
                typeDesc: TypeDesc.Withdrawal,
                fromDate: '2024-05-29',
                transactionType: TransactionType.Withdrawals,
            })
        );
        expect(result.current.transactions).toEqual([]);
    });

    it('should filter and sort transactions correctly when data is retrieved', async () => {
        const mockData = {
            Items: [
                {
                    TransactionDate: '2023-01-03',
                    Status: TransactionStatus.Done,
                    TransactionType: 'withdrawal',
                    TypeDesc: 'WITHDRAWAL',
                    TransactionAmount: 2100,
                },
                {
                    TransactionDate: '2023-01-01',
                    Status: TransactionStatus.Pending,
                    TransactionType: 'withdrawal',
                    TypeDesc: 'WITHDRAWAL',
                    TransactionAmount: 100,
                },
                {
                    TransactionDate: '2023-01-02',
                    Status: TransactionStatus.Done,
                    TransactionType: 'withdrawal',
                    TypeDesc: 'WITHDRAWAL',
                    TransactionAmount: 200,
                },
            ],
        };
        mockedTransactionsHistory.mockResolvedValue(Promise.resolve(mockData));
        const { result } = renderHook(() =>
            useTransactionsHistory({
                contract: '680160004',
                clientId: 'FLIC',
                typeDesc: TypeDesc.Withdrawal,
                transactionType: TransactionType.Withdrawals,
                fromDate: '2024-05-29',
            })
        );

        await waitFor(() =>
            expect(result.current.transactions).toEqual([
                {
                    TransactionDate: '2023-01-03',
                    Status: TransactionStatus.Done,
                    TransactionType: 'withdrawal',
                    TypeDesc: 'WITHDRAWAL',
                    TransactionAmount: 2100,
                },
                {
                    TransactionDate: '2023-01-02',
                    Status: TransactionStatus.Done,
                    TransactionType: 'withdrawal',
                    TypeDesc: 'WITHDRAWAL',
                    TransactionAmount: 200,
                },
                {
                    TransactionDate: '2023-01-01',
                    Status: TransactionStatus.Pending,
                    TransactionType: 'withdrawal',
                    TypeDesc: 'WITHDRAWAL',
                    TransactionAmount: 100,
                },
            ])
        );
    });
});
