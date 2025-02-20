import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Reason } from '@zinnia/api-types/types/sor';
import router from 'next/router';
import { useEffect, useMemo } from 'react';

import { PageHead } from '@deps/components/page-title';
import LoanAutopayContainer from '@deps/containers/financial-transactions/loan/loan-autopay/loan-autopay-container';
import { LoanAutopayProvider } from '@deps/contexts/transactions/LoanAutopayContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { checkEligibilitySystematicPrograms, TransactionResponseStatus } from '@deps/queries/api/bpm';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

export interface ManageLoanPaymentProps {
    policy: Policy;
}

const ManageLoanPayment = ({ policy }: ManageLoanPaymentProps) => {
    const systematicProgram = useMemo(() => policy.systematicPrograms?.find(sp => sp.reason === Reason.LOANREPAYMENT), [policy.systematicPrograms]);
    const arrangementId = systematicProgram?.arrangementId || '';

    useEffect(() => {
        const checkEligibility = async () => {
            const eligibilityCheck = await checkEligibilitySystematicPrograms(policy.product?.planCode, policy.policyNumber, arrangementId);
            if (eligibilityCheck.status === TransactionResponseStatus.Failure) {
                router.push(`/403`);

                return;
            }
        };
        checkEligibility();
    }, [arrangementId, policy.policyNumber, policy.product?.planCode]);

    return (
        <LoanAutopayProvider>
            <PageHead titleKey="loanAutopay" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <LoanAutopayContainer policy={policy} />
            </div>
        </LoanAutopayProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default ManageLoanPayment;
