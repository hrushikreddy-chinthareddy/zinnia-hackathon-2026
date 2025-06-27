import { render, screen } from '@testing-library/react';
import {
    Transaction,
    TransactionStatus,
    TransactionType,
} from '@zinnia/api-types/types/sor';
import { toTitleCase } from '@zinnia/utils';

import { SideSheetContext } from '@deps/contexts/SideSheetContext';
import {
    mockPolicy,
    mockPremiumSystematicProgram,
} from '@deps/jest/data/mockPolicy';

import HistoryEventCard from './history-event-card';
import { getHistoryEventCardValues } from './history-event-card.helpers';

jest.mock('@deps/queries/api/policies', () => {
    return {
        fetchVersionedPolicy: jest.fn(() => {
            return Promise.resolve(null);
        }),
        getPolicyTransaction: jest.fn(() => {
            return Promise.resolve(null);
        }),
    };
});

jest.mock('@deps/queries/api/bpm', () => {
    return {
        reverseRecreateTransaction: jest.fn(() => {
            return Promise.resolve(null);
        }),
    };
});

jest.mock('@deps/queries/api/cases', () => {
    return {
        getCases: jest.fn(() => {
            return Promise.resolve(null);
        }),
    };
});

const sample = {
    payors: [
        {
            partyId: mockPolicy?.parties?.[0]?.partyId,
            bankId: mockPolicy?.parties?.[0]?.bankDetails?.[0]?.bankId,
        },
    ],
    transactionType: 'InitialPremium',
    effectiveDate: '2023-06-26',
    status: 'Completed' as TransactionStatus,
    transactionAmounts: {
        requestedAmount: 22222,
        appliedAmount: 100000,
        paymentAmount: 86753.09,
    },
} as Transaction;

describe.skip('HistoryEventCard Component', () => {
    it('should render all props properly', () => {
        render(
            <SideSheetContext.Provider
                value={{
                    changeSideSheetContent: () => {},
                    handleLocation: () => {},
                    handleOpen: () => {},
                    openSecondarySideSheet: () => {},
                    onClose: () => {},
                }}
            >
                <HistoryEventCard
                    policy={mockPolicy}
                    refreshTransactions={() => {}}
                    transaction={sample}
                />
            </SideSheetContext.Provider>
        );

        expect(screen.getByText('11/20/2023')).toBeInTheDocument();
        expect(screen.getByText('Premium autopay')).toBeInTheDocument();
        expect(screen.getByText('$10,000.00')).toBeInTheDocument();
        expect(
            screen.getByText('Monthly | Checking ending in 1234')
        ).toBeInTheDocument();
    });
});

describe('getEventCardValues', () => {
    describe('returns a properly formatted object', () => {
        it('for Pending InitialPayment', () => {
            const {
                amount,
                caption,
                eventBody,
                eventTitle,
                isClickable,
                isPending,
            } = getHistoryEventCardValues(mockPolicy, {
                ...sample,
                status: 'Pending' as TransactionStatus,
                transactionType: TransactionType.PAYMENT_INITIAL_PREMIUM,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe(
                'historyEventCard.transactionTypes.PaymentInitialPremium'
            );
            expect(isClickable).toBe(true);
            expect(isPending).toBe(true);
        });

        it('for Pending PaymentOneTimePremium', () => {
            const {
                amount,
                caption,
                eventBody,
                eventTitle,
                isClickable,
                isPending,
            } = getHistoryEventCardValues(mockPolicy, {
                ...sample,
                status: 'Pending' as TransactionStatus,
                transactionType: TransactionType.PAYMENT_ONE_TIME_PREMIUM,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe(
                'historyEventCard.transactionTypes.PaymentOneTimePremium'
            );
            expect(isClickable).toBe(true);
            expect(isPending).toBe(true);
        });

        it('for Pending SubsequentPayment', () => {
            const {
                amount,
                caption,
                eventBody,
                eventTitle,
                isClickable,
                isPending,
            } = getHistoryEventCardValues(mockPolicy, {
                ...sample,
                status: 'Pending' as TransactionStatus,
                transactionType: TransactionType.SUBSEQUENT_PAYMENT,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe(
                `${toTitleCase(
                    mockPremiumSystematicProgram.frequency
                )} | historyEventCard.bankingBody`
            );
            expect(eventTitle).toBe(
                'historyEventCard.transactionTypes.SubsequentPayment'
            );
            expect(isClickable).toBe(true);
            expect(isPending).toBe(true);
        });

        it('for Completed InitialPremium', () => {
            const {
                amount,
                caption,
                eventBody,
                eventTitle,
                isClickable,
                isPending,
            } = getHistoryEventCardValues(mockPolicy, {
                ...sample,
                status: 'Completed' as TransactionStatus,
                transactionType: TransactionType.INITIAL_PREMIUM,
            });

            expect(amount).toBe(100000.0);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe(
                'historyEventCard.transactionTypes.InitialPremium'
            );
            expect(isClickable).toBe(true);
            expect(isPending).toBe(false);
        });

        it('for Completed OneTimePremium', () => {
            const {
                amount,
                caption,
                eventBody,
                eventTitle,
                isClickable,
                isPending,
            } = getHistoryEventCardValues(mockPolicy, {
                ...sample,
                status: 'Completed' as TransactionStatus,
                transactionType: TransactionType.ONE_TIME_PREMIUM,
            });

            expect(amount).toBe(100000.0);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe(
                'historyEventCard.transactionTypes.OneTimePremium'
            );
            expect(isClickable).toBe(true);
            expect(isPending).toBe(false);
        });

        it('for Completed SubsequentPremium', () => {
            const {
                amount,
                caption,
                eventBody,
                eventTitle,
                isClickable,
                isPending,
            } = getHistoryEventCardValues(mockPolicy, {
                ...sample,
                status: 'Completed' as TransactionStatus,
                transactionType: TransactionType.SUBSEQUENT_PREMIUM,
            });

            expect(amount).toBe(100000);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe(
                `${toTitleCase(
                    mockPremiumSystematicProgram.frequency
                )} | historyEventCard.bankingBody`
            );
            expect(eventTitle).toBe(
                'historyEventCard.transactionTypes.SubsequentPremium'
            );
            expect(isClickable).toBe(true);
            expect(isPending).toBe(false);
        });

        it('for Anniversary', () => {
            const {
                amount,
                caption,
                eventBody,
                eventTitle,
                isClickable,
                isPending,
            } = getHistoryEventCardValues(mockPolicy, {
                ...sample,
                status: 'Completed' as TransactionStatus,
                transactionType: TransactionType.ANNIVERSARY,
            });

            expect(amount).toBeUndefined();
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBeUndefined();
            expect(eventTitle).toBe(
                'historyEventCard.transactionTypes.Anniversary'
            );
            expect(isClickable).toBe(false);
            expect(isPending).toBe(false);
        });

        it('for Activation', () => {
            const {
                amount,
                caption,
                eventBody,
                eventTitle,
                isClickable,
                isPending,
            } = getHistoryEventCardValues(mockPolicy, {
                ...sample,
                status: 'Pending' as TransactionStatus,
                transactionType: TransactionType.ACTIVATION,
            });

            expect(amount).toBeUndefined();
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBeUndefined();
            expect(eventTitle).toBe(
                'historyEventCard.transactionTypes.Activation'
            );
            expect(isClickable).toBe(false);
            expect(isPending).toBe(true);
        });
    });
});
