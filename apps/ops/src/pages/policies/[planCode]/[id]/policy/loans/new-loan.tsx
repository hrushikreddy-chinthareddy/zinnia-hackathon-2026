import { useQuery } from '@tanstack/react-query';
import { Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import NewLoanContainer from '@deps/containers/financial-transactions/loan/new-loan/new-loan-container';
import { NewLoanProvider } from '@deps/contexts/transactions/NewLoanContext';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkNewLoanEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface NewLoanProps {
    policy: Policy;
}

const NewLoan = ({ policy }: NewLoanProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber, loanValues } = policy;
    const { planCode } = policy.product ?? {};

    const { data: newLoanEligibility, isFetched } = useQuery({
        queryKey: [
            'checkNewLoanEligibility',
            planCode,
            policyNumber,
            loanValues?.maximumLoanAmount,
        ],
        queryFn: () =>
            checkNewLoanEligibilityQuery(
                planCode as string,
                policyNumber as string,
                loanValues?.maximumLoanAmount
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleNewLoan:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    useEffect(() => {
        if (!isFetched) return;
        const isEligible = newLoanEligibility?.isEligibleNewLoan || false;
        if (!isEligible) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [newLoanEligibility, router]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <NewLoanProvider>
            <PageHead titleKey="newLoan" />
            <NewLoanContainer policy={policy as Policy} />
        </NewLoanProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/loans/new-loan',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/loans/new-loan',
    }
);

export default NewLoan;
