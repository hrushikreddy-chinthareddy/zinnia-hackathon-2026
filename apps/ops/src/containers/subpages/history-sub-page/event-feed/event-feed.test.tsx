import { render, screen, waitFor } from '@testing-library/react';

import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { getPolicyTransactions } from '@deps/queries/api/policies';

import EventFeed from './event-feed';
import { basePolicy, completedSubsequent, newLoanNonTransaction, pendingSubsequentTransaction } from './event-feed-test.helpers';

jest.mock('@deps/queries/api/policies');
jest.mock('@deps/utils/server-logging');

const mockedGetTransactions = jest.mocked(getPolicyTransactions);

describe.skip('EventFeed', () => {
    it('should render correctly when empty', async () => {
        mockedGetTransactions.mockReturnValueOnce(Promise.resolve([]));

        render(
            <PolicyData.Provider value={{ policy: basePolicy, policyDetails: new PolicyDetails(basePolicy), refreshPolicy: () => null }}>
                <EventFeed isSideSheetOpen={false} />
            </PolicyData.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('policy.history.completedEvents')).toBeInTheDocument();
            expect(screen.getByText('policy.history.noEventsTitle')).toBeInTheDocument();
            expect(screen.getByText('policy.history.noEventsSubtitle')).toBeInTheDocument();
            expect(screen.queryByText('policy.history.upcomingEvents')).not.toBeInTheDocument();
        });
    });

    it('should render correctly when there are only upcoming events', async () => {
        mockedGetTransactions.mockReturnValueOnce(Promise.resolve([]));
        mockedGetTransactions.mockReturnValueOnce(Promise.resolve([pendingSubsequentTransaction]));

        render(
            <PolicyData.Provider value={{ policy: basePolicy, policyDetails: new PolicyDetails(basePolicy), refreshPolicy: () => null }}>
                <EventFeed isSideSheetOpen={false} />
            </PolicyData.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('policy.history.completedEvents')).toBeInTheDocument();
            expect(screen.getByText('policy.history.noEventsTitle')).toBeInTheDocument();
            expect(screen.getByText('policy.history.noEventsSubtitle')).toBeInTheDocument();
            expect(screen.getByText('policy.history.upcomingEvents')).toBeInTheDocument();
            expect(screen.getByText('historyEventCard.bankingBody')).toBeInTheDocument();
            expect(screen.getByText('historyEventCard.premiumAutopay')).toBeInTheDocument();
            expect(screen.getByText('$80.00')).toBeInTheDocument();
        });
    });

    it('should render correctly when there are only completed events including non-financial', async () => {
        mockedGetTransactions.mockReturnValueOnce(Promise.resolve([newLoanNonTransaction, completedSubsequent]));

        render(
            <PolicyData.Provider value={{ policy: basePolicy, policyDetails: new PolicyDetails(basePolicy), refreshPolicy: () => null }}>
                <EventFeed isSideSheetOpen={false} />
            </PolicyData.Provider>
        );

        await waitFor(() => {
            expect(screen.queryByText('policy.history.noEventsTitle')).not.toBeInTheDocument();
            expect(screen.queryByText('policy.history.noEventsSubtitle')).not.toBeInTheDocument();
            expect(screen.queryByText('policy.history.upcomingEvents')).not.toBeInTheDocument();

            expect(screen.getByText('policy.history.completedEvents')).toBeInTheDocument();
            expect(screen.getByText('12/6/2023')).toBeInTheDocument();
            expect(screen.getByText('historyEventCard.loan')).toBeInTheDocument();

            expect(screen.getByText('11/11/2023')).toBeInTheDocument();
            expect(screen.getByText('historyEventCard.premiumAutopay')).toBeInTheDocument();
            expect(screen.getByText('historyEventCard.bankingBody')).toBeInTheDocument();
            expect(screen.getByText('$80.00')).toBeInTheDocument();
        });
    });

    it('should render correctly with uncompleted transactions and completed spanning years', async () => {
        mockedGetTransactions.mockReturnValueOnce(
            Promise.resolve([
                newLoanNonTransaction,
                completedSubsequent,
                { ...completedSubsequent, caseId: 'iJustNeedADiffId', effectiveDate: '2022-11-11' },
            ])
        );
        mockedGetTransactions.mockReturnValueOnce(Promise.resolve([pendingSubsequentTransaction]));

        render(
            <PolicyData.Provider value={{ policy: basePolicy, policyDetails: new PolicyDetails(basePolicy), refreshPolicy: () => null }}>
                <EventFeed isSideSheetOpen={false} />
            </PolicyData.Provider>
        );

        await waitFor(() => {
            // screen.debug();

            expect(screen.queryByText('policy.history.noEventsTitle')).not.toBeInTheDocument();
            expect(screen.queryByText('policy.history.noEventsSubtitle')).not.toBeInTheDocument();
            expect(screen.queryByText('policy.history.upcomingEvents')).toBeInTheDocument();

            expect(screen.getByText('policy.history.completedEvents')).toBeInTheDocument();
            expect(screen.getByText('12/6/2023')).toBeInTheDocument();
            expect(screen.getByText('historyEventCard.loan')).toBeInTheDocument();
            expect(screen.getByText('policy.history.completedEvents')).toBeInTheDocument();

            expect(screen.getByText('11/11/2023')).toBeInTheDocument();
            expect(screen.getByText('11/11/2022')).toBeInTheDocument();

            expect(screen.getByText('2022')).toBeInTheDocument();
            expect(screen.queryAllByText('historyEventCard.premiumAutopay')).toHaveLength(3);
            expect(screen.queryAllByText('historyEventCard.bankingBody')).toHaveLength(3);
            expect(screen.queryAllByText('$80.00')).toHaveLength(3);
        });
    });
});
