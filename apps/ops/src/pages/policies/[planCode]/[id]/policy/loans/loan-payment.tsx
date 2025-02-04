import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import router from 'next/router';
import { useEffect } from 'react';

import { PageHead } from '@deps/components/page-title';
import LoanPaymentContainer from '@deps/containers/financial-transactions/loan/loan-payment/loan-payment-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { LoanPaymentProvider } from '@deps/contexts/transactions/LoanPaymentContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { checkEligibilityLoanRepaymentOneTime, TransactionResponseStatus } from '@deps/queries/api/bpm';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

export interface PolicyLoanPaymentProps {
    policy: Policy;
}

const LoanPayment = ({ policy }: PolicyLoanPaymentProps) => {
    const { featureFlags } = useOptimizely();
    const loanPaymentEnabled = featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];

    useEffect(() => {
        const checkEligibility = async () => {

            if (!loanPaymentEnabled) {
                router.push(`/403`);

                return;
            }

            const eligibilityCheck = await checkEligibilityLoanRepaymentOneTime(policy.product?.planCode, policy.policyNumber);

            if (eligibilityCheck.status === TransactionResponseStatus.Failure) {
                router.push(`/403`);

                return;
            }
        };
        checkEligibility();
    }, [loanPaymentEnabled, policy.policyNumber, policy.product?.planCode]);

    return (
        <LoanPaymentProvider>
            <PageHead titleKey="loanPayment" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <LoanPaymentContainer policy={policy} />
            </div>
        </LoanPaymentProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default LoanPayment;
