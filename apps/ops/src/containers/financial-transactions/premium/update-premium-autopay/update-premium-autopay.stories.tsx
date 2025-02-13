import { Meta } from '@storybook/react';

import { UpdatePremiumAutopayProvider } from '@deps/contexts/transactions/UpdatePremiumAutopayContext';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import UpdatePremiumAutopayContainer from './update-premium-autopay-container';

export default {
    title: 'Containers/UpdatePremiumAutopayContainer',
    component: UpdatePremiumAutopayContainer,
} as Meta<typeof UpdatePremiumAutopayContainer>;

const ContainerHelper = ({ policy }: any) => {
    return <UpdatePremiumAutopayContainer policy={policy} />;
};

export const Default = () => {
    return (
        <div className="p-6">
            <UpdatePremiumAutopayProvider>
                <ContainerHelper policy={mockPolicy} />
            </UpdatePremiumAutopayProvider>
        </div>
    );
};
