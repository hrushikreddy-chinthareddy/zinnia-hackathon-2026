import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import React from 'react';

import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { ArrangementType, Policy, Reason } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

interface UpdateAutopayProps {
    policy: Policy;
}

const UpdateAutopay = ({ policy }: UpdateAutopayProps) => {
    return (
        <AutopayProvider>
            <PageHead titleKey="updatePremium" />
            <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
                <AutopayContainer
                    policy={policy}
                    arrangementType={ArrangementType.PAYMENT}
                    parentPage={ParentPage.Premiums}
                    systematicProgramReason={Reason.PREMIUM}
                    translationKeyPrefix='premiumAutopay'
                />
            </div>
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default UpdateAutopay;
