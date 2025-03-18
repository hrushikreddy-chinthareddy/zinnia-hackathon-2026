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
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface LoanPaymentOneTimeProps {
    policy: Policy;
}

const LoanPaymentOneTime = ({ policy }: LoanPaymentOneTimeProps) => {
    const { featureFlags } = useOptimizely();
    const loanPaymentEnabled = featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];

    useEffect(() => {
        const checkEligibility = async () => {
            if (!loanPaymentEnabled) {
                router.push(`/403`);

                return;
            }
            const eligibilityCheck = await checkEligibilityLoanRepaymentOneTime(
                policy.product?.planCode,
                policy.policyNumber,
                policy.loanValues?.totalLoanBalance
            );

            if (eligibilityCheck.status === TransactionResponseStatus.Failure) {
                router.push(`/403`);

                return;
            }
        };
        checkEligibility();
    }, [loanPaymentEnabled, policy.loanValues?.totalLoanBalance, policy.policyNumber, policy.product?.planCode]);

    return (
        <LoanPaymentProvider>
            <PageHead titleKey="loanPayment" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <LoanPaymentContainer policy={policy} />
            </div>
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
