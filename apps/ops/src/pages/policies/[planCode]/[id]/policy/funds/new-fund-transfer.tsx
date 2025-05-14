import { PageHead } from '@deps/components/page-title';
import FundTransferContainer from '@deps/containers/financial-transactions/fund-transfer/fund-transfer-container';
import { FundTransferProvider } from '@deps/contexts/transactions/FundTransferContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

interface fundProps {
    policy: Policy;
}

const FundTransfer = ({ policy }: fundProps) => {
    return (
        <FundTransferProvider>
            <PageHead titleKey="fundTransfer" />
            <div className="flex w-full flex-col overflow-auto px-4 md:px-6 lg:px-8">
                <FundTransferContainer policy={policy} />
            </div>
        </FundTransferProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/funds/new-fund-transfer',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/funds/new-fund-transfer',
    }
);

export default FundTransfer;
