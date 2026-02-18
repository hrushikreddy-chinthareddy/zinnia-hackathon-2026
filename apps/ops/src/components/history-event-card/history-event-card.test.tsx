import { render, screen } from '@testing-library/react';

import {
    MittEvents,
    SideSheetContextLegacy,
} from '@deps/contexts/SideSheetContext';
import useEmitter from '@deps/hooks/useEmitter';
import {
    mockPolicy,
    mockPremiumSystematicProgram,
} from '@deps/jest/data/mockPolicy';
import { toTitleCase } from '@deps/utils/strings';
import {
    TransactionTypeEnum,
    Transaction,
    TransactionStatus,
} from '@zinnia/api-types/types/sor';

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
        const emitter = useEmitter<MittEvents>();
        render(
            <SideSheetContextLegacy.Provider
                value={{
                    changeSideSheetContent: () => {},
                    handleLocation: () => {},
                    handleOpen: () => {},
                    openSecondarySideSheet: () => {},
                    onClose: () => {},
                    events: emitter,
                }}
            >
                <HistoryEventCard
                    policy={mockPolicy}
                    refreshTransactions={() => {}}
                    transaction={sample}
                />
            </SideSheetContextLegacy.Provider>
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
                transactionType: TransactionTypeEnum.PAYMENT_INITIAL_PREMIUM,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe('enums.PaymentInitialPremium');
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
                transactionType: TransactionTypeEnum.PAYMENT_ONE_TIME_PREMIUM,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe('enums.PaymentOneTimePremium');
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
                transactionType: TransactionTypeEnum.SUBSEQUENT_PAYMENT,
            });

            expect(amount).toBe(86753.09);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe(
                `${toTitleCase(
                    mockPremiumSystematicProgram.frequency
                )} | historyEventCard.bankingBody`
            );
            expect(eventTitle).toBe('enums.SubsequentPayment');
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
                transactionType: TransactionTypeEnum.INITIAL_PREMIUM,
            });

            expect(amount).toBe(100000.0);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe('enums.InitialPremium');
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
                transactionType: TransactionTypeEnum.ONE_TIME_PREMIUM,
            });

            expect(amount).toBe(100000.0);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe('historyEventCard.bankingBody');
            expect(eventTitle).toBe('enums.OneTimePremium');
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
                transactionType: TransactionTypeEnum.SUBSEQUENT_PREMIUM,
            });

            expect(amount).toBe(100000);
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBe(
                `${toTitleCase(
                    mockPremiumSystematicProgram.frequency
                )} | historyEventCard.bankingBody`
            );
            expect(eventTitle).toBe('enums.SubsequentPremium');
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
                transactionType: TransactionTypeEnum.ANNIVERSARY,
            });

            expect(amount).toBeUndefined();
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBeUndefined();
            expect(eventTitle).toBe('enums.Anniversary');
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
                transactionType: TransactionTypeEnum.ACTIVATION,
            });

            expect(amount).toBeUndefined();
            expect(caption).toBe('6/26/2023');
            expect(eventBody).toBeUndefined();
            expect(eventTitle).toBe('enums.Activation');
            expect(isClickable).toBe(false);
            expect(isPending).toBe(true);
        });
    });
});
