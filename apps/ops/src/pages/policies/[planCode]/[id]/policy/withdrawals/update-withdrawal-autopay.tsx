import { useRouter } from 'next/router';

import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { ArrangementType, Policy, Reason } from '@zinnia/api-types/types/sor';

export interface WithdrawalAutopayProps {
    policy: Policy;
}

const UpdateWithdrawalAutoPay = ({ policy }: WithdrawalAutopayProps) => {
    const router = useRouter();
    const { type } = router.query;

    const arrangementType =
        type === 'RMD'
            ? ArrangementType.REQUIREDMINIMUMDISTRIBUTION
            : ArrangementType.WITHDRAWAL;
    const reason =
        type === 'RMD' ? Reason.REQUIREDMINIMUMDISTRIBUTION : Reason.WITHDRAWAL;

    return (
        <AutopayProvider>
            <PageHead titleKey="newWithdrawal" />
            <AutopayContainer
                arrangementType={arrangementType}
                policy={policy}
                parentPage={ParentPage.Withdrawals}
                systematicProgramReason={reason}
                translationKeyPrefix="withdrawalAutopay"
                isSetUp={false}
            />
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/withdrawals/update-withdrawal-autopay',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/withdrawals/update-withdrawal-autopay',
    }
);

export default UpdateWithdrawalAutoPay;
