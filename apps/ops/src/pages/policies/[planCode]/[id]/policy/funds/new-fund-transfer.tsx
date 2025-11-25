import { PageHead } from '@deps/components/page-title';
import FundTransferContainer from '@deps/containers/financial-transactions/fund-transfer/fund-transfer-container';
import { FundTransferProvider } from '@deps/contexts/transactions/FundTransferContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

interface fundProps {
    policy: Policy;
}

const FundTransfer = ({ policy }: fundProps) => {
    return (
        <FundTransferProvider>
            <PageHead titleKey="fundTransfer" />
            <FundTransferContainer policy={policy} />
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
