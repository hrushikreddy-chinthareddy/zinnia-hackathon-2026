import { Meta } from '@storybook/react';

import { WithdrawalProvider } from '@deps/contexts/transactions/WithdrawalContext';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import WithdrawalContainer from './withdrawal-container';

export default {
    title: 'Containers/WithdrawalContainer',
    component: WithdrawalContainer,
} as Meta<typeof WithdrawalContainer>;

const ContainerHelper = ({ policy }: any) => {
    return <WithdrawalContainer policy={policy} />;
};

export const Withdrawal = () => {
    return (
        <div className="p-6">
            <WithdrawalProvider>
                <ContainerHelper policy={mockPolicy} />
            </WithdrawalProvider>
        </div>
    );
};
