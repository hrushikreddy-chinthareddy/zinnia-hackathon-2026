import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import router from 'next/router';
import { useEffect } from 'react';

import { PageHead } from '@deps/components/page-title';
import LoanAutopayContainer from '@deps/containers/financial-transactions/loan/loan-autopay/loan-autopay-container';
import { LoanAutopayProvider } from '@deps/contexts/transactions/LoanAutopayContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

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

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default StartLoanPayment;
