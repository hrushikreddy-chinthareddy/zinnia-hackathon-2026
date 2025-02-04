import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import router from 'next/router';
import { useEffect } from 'react';

import { PageHead } from '@deps/components/page-title';
import NewLoanContainer from '@deps/containers/financial-transactions/loan/new-loan/new-loan-container';
import { NewLoanProvider } from '@deps/contexts/transactions/NewLoanContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { checkEligibilityNewLoan, TransactionResponseStatus } from '@deps/queries/api/bpm';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';

export interface PolicyLoanProps {
    policy: Policy;
}

const NewLoan = ({ policy }: PolicyLoanProps) => {
    useEffect(() => {
        const checkEligibility = async () => {
            const eligibilityCheck = await checkEligibilityNewLoan(policy.product?.planCode, policy.policyNumber, policy.loanValues?.maximumLoanAmount);
            
            if (eligibilityCheck.status === TransactionResponseStatus.Failure) {
                router.push(`/403`);

                return;
            }
        };
        checkEligibility();
    }, [policy.loanValues?.maximumLoanAmount, policy.policyNumber, policy.product?.planCode]);

    return (
        <NewLoanProvider>
            <PageHead titleKey="newLoan" />
            <div className="px-4 py-6 flex justify-center md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-0 xl:py-16">
                <NewLoanContainer policy={policy} />
            </div>
        </NewLoanProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: getServerSidePropsPolicyDetailsPage,
});

export default NewLoan;
