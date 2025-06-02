import { Meta, StoryObj } from '@storybook/react';
import { Transaction, TransactionStatus } from '@zinnia/api-types/types/sor';

import { mockPolicy } from '@deps/services/mocks/sor-policy';

import DividerLabel, { DividerLabelProps } from './divider-label';
import HistoryEventCard from '../history-event-card/history-event-card';

type StoryType = StoryObj<DividerLabelProps>;

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

export default {
    title: 'Components/DividerLabel',
    component: DividerLabel,
} as Meta<typeof DividerLabel>;

export const Default: StoryType = {
    args: {
        children: <h3>{new Date().getFullYear()}</h3>,
    },
};

export const YearDivider: StoryType = {
    render: () => (
        <section id="events">
            {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(year => (
                <>
                    <DividerLabel>
                        <h3 className="my-4">{year}</h3>
                    </DividerLabel>
                    <div className="flex flex-col gap-4">
                        {[...Array(1)].map((_, i) => (
                            <HistoryEventCard policy={mockPolicy} refreshTransactions={() => {}} transaction={sample} key={i} />
                        ))}
                    </div>
                </>
            ))}
        </section>
    ),
};
