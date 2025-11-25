import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { ArrangementType, Policy, Reason } from '@zinnia/api-types/types/sor';

interface UpdateAutopayProps {
    policy: Policy;
}

const AddPremiumAutopay = ({ policy }: UpdateAutopayProps) => {
    return (
        <AutopayProvider>
            <PageHead titleKey="addPremiumAutopay" />
            <AutopayContainer
                arrangementType={ArrangementType.PAYMENT}
                isSetUp={true}
                policy={policy}
                parentPage={ParentPage.Premiums}
                systematicProgramReason={Reason.PREMIUM}
                translationKeyPrefix="premiumAutopay"
            />
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'pages/policies/[planCode]/[id]/policy/premiums/add-premium-autopay',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/premiums/add-premium-autopay',
    }
);

export default AddPremiumAutopay;
