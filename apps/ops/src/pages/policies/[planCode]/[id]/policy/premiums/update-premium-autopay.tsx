import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { ArrangementType, Policy, Reason } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

interface UpdateAutopayProps {
    policy: Policy;
}

const UpdateAutopay = ({ policy }: UpdateAutopayProps) => {
    return (
        <AutopayProvider>
            <PageHead titleKey="updatePremium" />
            <div className="flex w-full flex-col overflow-auto px-4 md:px-6 lg:px-8">
                <AutopayContainer
                    policy={policy}
                    arrangementType={ArrangementType.PAYMENT}
                    parentPage={ParentPage.Premiums}
                    systematicProgramReason={Reason.PREMIUM}
                    translationKeyPrefix="premiumAutopay"
                />
            </div>
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/premiums/update-premium-autopay',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/premiums/update-premium-autopay',
    }
);

export default UpdateAutopay;
