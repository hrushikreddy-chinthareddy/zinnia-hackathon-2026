import { PageHead } from '@deps/components/page-title';
import LoanPaymentContainer from '@deps/containers/financial-transactions/loan/loan-payment/loan-payment-container';
import { LoanPaymentProvider } from '@deps/contexts/transactions/LoanPaymentContext';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

export interface LoanPaymentOneTimeProps {
    policy: Policy;
}

const LoanPaymentOneTime = ({ policy }: LoanPaymentOneTimeProps) => {
    return (
        <LoanPaymentProvider>
            <PageHead titleKey="loanPayment" />
            <LoanPaymentContainer policy={policy} />
        </LoanPaymentProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/loans/loan-payment',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/loans/loan-payment',
    }
);

export default LoanPaymentOneTime;
