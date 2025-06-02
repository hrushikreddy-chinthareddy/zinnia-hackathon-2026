import { ArrangementType, Policy, Reason } from '@zinnia/api-types/types/sor';

import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface StartLoanPaymentProps {
    policy: Policy;
}

const StartLoanPayment = ({ policy }: StartLoanPaymentProps) => {
    return (
        <AutopayProvider>
            <PageHead titleKey="loanAutopay" />
            <AutopayContainer
                arrangementType={ArrangementType.LOANREPAYMENT}
                isSetUp={true}
                policy={policy}
                parentPage={ParentPage.Loans}
                systematicProgramReason={Reason.LOANREPAYMENT}
                translationKeyPrefix="loanAutopay"
            />
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/loans/start-loan-payment',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/loans/start-loan-payment',
    }
);

export default StartLoanPayment;
