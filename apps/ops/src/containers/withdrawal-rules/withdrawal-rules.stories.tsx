import { Meta } from '@storybook/react';

import { mockPolicy } from '@deps/jest/data/mockPolicy';

import WithdrawalRules from './withdrawal-rules';

export default {
    title: 'Containers/WithdrawalRules',
    component: WithdrawalRules,
} as Meta<typeof WithdrawalRules>;

export const Withdrawals = () => {
    return (
        <div className="p-6">
            <WithdrawalRules policy={mockPolicy} />
        </div>
    );
};
