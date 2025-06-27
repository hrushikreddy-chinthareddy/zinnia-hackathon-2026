import { Meta } from '@storybook/react';

import { WithdrawalInfo as WithdrawalInfoComponent } from './withdrawal-info';

export default {
    title: 'Components/GlobalValues/WithdrawalInfo',
    component: WithdrawalInfoComponent,
    decorators: [
        (Story) => (
            <div className="h-screen bg-white">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof WithdrawalInfoComponent>;

export const WithdrawalInfo = () => <WithdrawalInfoComponent amount={100} />;
