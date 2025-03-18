import { PageHead } from '@deps/components/page-title';
import UpdatePremiumAutopayContainer from '@deps/containers/financial-transactions/premium/update-premium-autopay/update-premium-autopay-container';
import { UpdatePremiumAutopayProvider } from '@deps/contexts/transactions/UpdatePremiumAutopayContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

interface UpdateAutopayProps {
    policy: Policy;
}

const UpdateAutopay = ({ policy }: UpdateAutopayProps) => {
    return (
        <UpdatePremiumAutopayProvider>
            <PageHead titleKey="updatePremium" />
            <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
                <UpdatePremiumAutopayContainer policy={policy} />
            </div>
        </UpdatePremiumAutopayProvider>
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
