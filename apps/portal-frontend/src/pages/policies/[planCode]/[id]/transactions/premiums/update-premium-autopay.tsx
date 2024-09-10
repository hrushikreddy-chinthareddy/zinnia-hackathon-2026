import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import React from 'react';

import { PageHead } from '@deps/components/page-title';
import UpdatePremiumAutopay from '@deps/containers/update-premium-autopay-container/update-premium-autopay-container';
import { UpdatePremiumAutopayProvider } from '@deps/contexts/UpdatePremiumAutopayContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

interface UpdateAutopayProps {
    policy: Policy;
}

const UpdateAutopay = ({ policy }: UpdateAutopayProps) => {
    return (
        <UpdatePremiumAutopayProvider>
            <PageHead titleKey="updatePremium" />
            <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
                <UpdatePremiumAutopay policy={policy} />
            </div>
        </UpdatePremiumAutopayProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default UpdateAutopay;
