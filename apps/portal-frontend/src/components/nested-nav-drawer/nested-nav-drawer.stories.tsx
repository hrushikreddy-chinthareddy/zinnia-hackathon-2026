import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import { StaticNestedNavDrawerProvider } from '@deps/contexts/LayoutContexts/StaticNestedNavDrawerContext';

import NestedNavDrawer from './nested-nav-drawer';

const meta: Meta<typeof NestedNavDrawer> = {
    title: 'Components/NestedNavDrawer',
    component: NestedNavDrawer,
    args: {
        policyId: 'testId',
    },
};

export default meta;

export const Default = () => {
    return (
        <StaticNestedNavDrawerProvider>
            <NestedNavDrawer planCode="SBFIXUL1" policyId="testId" />
        </StaticNestedNavDrawerProvider>
    );
};

Default.parameters = {
    nextjs: {
        router: {
            pathname: '/policies/SBFIXUL1/testId/policy/coverage',
            asPath: '/policies/SBFIXUL1/testId/policy/coverage',
        },
    },
};
