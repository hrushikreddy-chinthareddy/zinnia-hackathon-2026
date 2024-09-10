import { Meta } from '@storybook/react';

import { PremiumProvider } from '@deps/contexts/NewPremiumContext';
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
            <PremiumProvider>
                <ContainerHelper policy={mockPolicy} />
            </PremiumProvider>
        </div>
    );
};
