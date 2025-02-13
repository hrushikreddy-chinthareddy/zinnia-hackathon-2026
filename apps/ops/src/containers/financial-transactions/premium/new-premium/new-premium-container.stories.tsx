import { Meta } from '@storybook/react';

import { NewPremiumProvider } from '@deps/contexts/transactions/NewPremiumContext';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import NewPremiumContainer from './new-premium-container';

export default {
    title: 'Containers/NewPremiumContainer',
    component: NewPremiumContainer,
} as Meta<typeof NewPremiumContainer>;

const ContainerHelper = ({ policy }: any) => {
    return <NewPremiumContainer policy={policy} />;
};

export const NewPremium = () => {
    return (
        <div className="p-6">
            <NewPremiumProvider>
                <ContainerHelper policy={mockPolicy} />
            </NewPremiumProvider>
        </div>
    );
};
