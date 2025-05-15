import { PageHead } from '@deps/components/page-title';
import NewPremiumContainer from '@deps/containers/financial-transactions/premium/new-premium/new-premium-container';
import { NewPremiumProvider } from '@deps/contexts/transactions/NewPremiumContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

interface NewPremiumProps {
    policy: Policy;
}

const NewPremium = ({ policy }: NewPremiumProps) => {
    return (
        <NewPremiumProvider>
            <PageHead titleKey="newPremium" />
            <NewPremiumContainer policy={policy} />
        </NewPremiumProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/premiums/new-premium',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/premiums/new-premium',
    }
);

export default NewPremium;
