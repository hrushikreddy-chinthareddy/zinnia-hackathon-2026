import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import React from 'react';

import { PageHead } from '@deps/components/page-title';
import NewPremiumContainer from '@deps/containers/financial-transactions/premium/new-premium/new-premium-container';
import { NewPremiumProvider } from '@deps/contexts/transactions/NewPremiumContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

interface NewPremiumProps {
    policy: Policy;
}

const NewPremium = ({ policy }: NewPremiumProps) => {
    return (
        <NewPremiumProvider>
            <PageHead titleKey="newPremium" />
            <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
                <NewPremiumContainer policy={policy} />
            </div>
        </NewPremiumProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default NewPremium;
