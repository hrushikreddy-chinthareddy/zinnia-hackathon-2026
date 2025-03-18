import router from 'next/router';
import { useEffect } from 'react';

import { PageHead } from '@deps/components/page-title';
import LoanAutopayContainer from '@deps/containers/financial-transactions/loan/loan-autopay/loan-autopay-container';
import { LoanAutopayProvider } from '@deps/contexts/transactions/LoanAutopayContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface StartLoanPaymentProps {
    policy: Policy;
}

const StartLoanPayment = ({ policy }: StartLoanPaymentProps) => {
    useEffect(() => {
        if (!policy?.loanValues?.totalLoanBalance || policy.loanValues.totalLoanBalance <= 0) {
            router.push(`/403`);

            return;
        }
    }, [policy?.loanValues?.totalLoanBalance]);

    return (
        <LoanAutopayProvider>
            <PageHead titleKey="loanAutopay" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <LoanAutopayContainer isSetUp={true} policy={policy} />
            </div>
        </LoanAutopayProvider>
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
