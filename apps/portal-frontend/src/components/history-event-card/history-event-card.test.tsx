import { render, screen } from '@testing-library/react';

import { SideSheetContext } from '@deps/contexts/SideSheetContext';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { Transaction, TransactionStatus, TransactionType } from '@deps/models/policy/sor-policy';
import {} from '@deps/setupTests';

import HistoryEventCard from './history-event-card';
import { getEventCardValues } from './history-event-card.helper';

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
    transactionAmounts: { requestedAmount: 22222, appliedAmount: 100000, paymentAmount: 86753.09 },
} as Transaction;

describe('HistoryEventCard Component', () => {
    it('should render all props properly', () => {
        render(
            <SideSheetContext.Provider value={{ changeSideSheetContent: () => {}, handleLocation: () => {}, handleOpen: () => {} }}>
                <HistoryEventCard
                    amount={10000.0}
                    caption="11/20/2023"
                    eventBody="Monthly | Checking ending in 1234"
                    eventTitle="Premium autopay"
                    isClickable={true}
                    isPending={false}
                />
            </SideSheetContext.Provider>
        );

        expect(screen.getByText('11/20/2023')).toBeInTheDocument();
        expect(screen.getByText('Premium autopay')).toBeInTheDocument();
        expect(screen.getByText('$10,000.00')).toBeInTheDocument();
        expect(screen.getByText('Monthly | Checking ending in 1234')).toBeInTheDocument();
    });
});

describe('getEventCardValues', () => {
    describe('returns a properly formatted object', () => {
        it('for Pending InitialPayment', () => {
            const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getEventCardValues(mockPolicy, {
                ...sample,
                status: 'Pending' as TransactionStatus,
                transactionType: TransactionType.PaymentInitialPremium,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.initialPayment | historyEventCard.bankingBody');
            expect(eventTitle).toBe('historyEventCard.premiumPayment');
            expect(isClickable).toBe(true);
            expect(isPending).toBe(true);
        });

        it('for Pending PaymentOneTimePremium', () => {
            const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getEventCardValues(mockPolicy, {
                ...sample,
                status: 'Pending' as TransactionStatus,
                transactionType: TransactionType.PaymentOneTimePremium,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.oneTimePayment | historyEventCard.bankingBody');
            expect(eventTitle).toBe('historyEventCard.premiumPayment');
            expect(isClickable).toBe(true);
            expect(isPending).toBe(true);
        });

        it('for Pending SubsequentPayment', () => {
            const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getEventCardValues(mockPolicy, {
                ...sample,
                status: 'Pending' as TransactionStatus,
                transactionType: TransactionType.SubsequentPayment,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe('historyEventCard.premiumAutopay');
            expect(isClickable).toBe(true);
            expect(isPending).toBe(true);
        });

        it('for Completed InitialPremium', () => {
            const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getEventCardValues(mockPolicy, {
                ...sample,
                status: 'Completed' as TransactionStatus,
                transactionType: TransactionType.InitialPremium,
            });

            expect(amount).toBe(100000.0);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.initialPayment | historyEventCard.bankingBody');
            expect(eventTitle).toBe('historyEventCard.premiumPayment');
            expect(isClickable).toBe(true);
            expect(isPending).toBe(false);
        });

        it('for Completed OneTimePremium', () => {
            const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getEventCardValues(mockPolicy, {
                ...sample,
                status: 'Completed' as TransactionStatus,
                transactionType: TransactionType.OneTimePremium,
            });

            expect(amount).toBe(100000.0);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.oneTimePayment | historyEventCard.bankingBody');
            expect(eventTitle).toBe('historyEventCard.premiumPayment');
            expect(isClickable).toBe(true);
            expect(isPending).toBe(false);
        });

        it('for Completed SubsequentPremium', () => {
            const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getEventCardValues(mockPolicy, {
                ...sample,
                status: 'Completed' as TransactionStatus,
                transactionType: TransactionType.SubsequentPremium,
            });

            expect(amount).toBe(100000.0);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe('historyEventCard.premiumAutopay');
            expect(isClickable).toBe(true);
            expect(isPending).toBe(false);
        });

        it('for Anniversary', () => {
            const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getEventCardValues(mockPolicy, {
                ...sample,
                status: 'Completed' as TransactionStatus,
                transactionType: TransactionType.Anniversary,
            });

            expect(amount).toBeUndefined();
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBeUndefined();
            expect(eventTitle).toBe('historyEventCard.policyAnniversary');
            expect(isClickable).toBe(false);
            expect(isPending).toBe(false);
        });

        it('for Activation', () => {
            const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getEventCardValues(mockPolicy, {
                ...sample,
                status: 'Pending' as TransactionStatus,
                transactionType: TransactionType.Activation,
            });

            expect(amount).toBeUndefined();
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBeUndefined();
            expect(eventTitle).toBe('historyEventCard.policyActivation');
            expect(isClickable).toBe(false);
            expect(isPending).toBe(true);
        });
    });
});
