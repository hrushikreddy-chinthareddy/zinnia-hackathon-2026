import { PageHead } from '@deps/components/page-title';
import WithdrawalContainer from '@deps/containers/financial-transactions/withdrawal/withdrawal-container';
import { WithdrawalProvider } from '@deps/contexts/transactions/WithdrawalContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface PolicyWithdrawalProps {
    policy: Policy;
}

const NewWithdrawal = ({ policy }: PolicyWithdrawalProps) => {
    return (
        <WithdrawalProvider>
            <PageHead titleKey="newWithdrawal" />
            <div
                style={{
                    minHeight: 'calc(100vh - 80px)',
                }}
            >
                <WithdrawalContainer policy={policy} />
            </div>
        </WithdrawalProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/withdrawals/new-withdrawal',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/withdrawals/new-withdrawal',
    }
);

export default NewWithdrawal;
