import { Meta, StoryObj } from '@storybook/react';

import DividerLabel, { DividerLabelProps } from './divider-label';
import HistoryEventCard from '../history-event-card/history-event-card';

type StoryType = StoryObj<DividerLabelProps>;

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
                            <HistoryEventCard
                                amount={12000.0}
                                caption={`12/31/${year}`}
                                eventBody="Monthly | Checking ending in 1234"
                                eventTitle="Premium autopay"
                                isClickable={true}
                                isPending={false}
                                key={i}
                            />
                        ))}
                    </div>
                </>
            ))}
        </section>
    ),
};
