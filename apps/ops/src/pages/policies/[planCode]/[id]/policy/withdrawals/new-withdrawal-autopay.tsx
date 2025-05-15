import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface WithdrawalAutopayProps {
    policy: Policy;
}

const NewWithdrawalAutoPay = ({ policy }: WithdrawalAutopayProps) => {
    return (
        <AutopayProvider>
            <PageHead titleKey="newWithdrawal" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <AutopayContainer
                    arrangementType={undefined}
                    policy={policy}
                    parentPage={ParentPage.Withdrawals}
                    systematicProgramReason={undefined}
                    translationKeyPrefix="withdrawalAutopay"
                    isSetUp={true}
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
        file: 'policies/[planCode]/[id]/policy/withdrawals/new-withdrawal-autopay',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/withdrawals/new-withdrawal-autopay',
    }
);

export default NewWithdrawalAutoPay;
