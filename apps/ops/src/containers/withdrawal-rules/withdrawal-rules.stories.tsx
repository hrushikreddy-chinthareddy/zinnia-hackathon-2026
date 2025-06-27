import { Meta, StoryObj } from '@storybook/react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import WithdrawalRules from './withdrawal-rules';

const meta: Meta<typeof WithdrawalRules> = {
    title: 'Containers/WithdrawalRules',
    component: WithdrawalRules,
    decorators: (Story) => (
        <div className="p-6">
            <Story />
        </div>
    ),
};

export default meta;

export const Withdrawals: StoryObj<typeof WithdrawalRules> = {
    args: {
        policy: mockPolicy,
        policyDetails: new PolicyDetails(mockPolicy),
    },
};
