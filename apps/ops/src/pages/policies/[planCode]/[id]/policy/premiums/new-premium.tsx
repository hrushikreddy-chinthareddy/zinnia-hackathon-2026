import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import NewPremiumContainer from '@deps/containers/financial-transactions/premium/new-premium/new-premium-container';
import { NewPremiumProvider } from '@deps/contexts/transactions/NewPremiumContext';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkOneTimePremiumEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { TransactionPermission } from '@deps/utils/auth';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

interface NewPremiumProps {
    policy: Policy;
}

const NewPremium = ({ policy }: NewPremiumProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const { policyNumber } = policy;
    const { planCode } = policy.product ?? {};

    const { data: oneTimePremiumEligibility, isFetched } = useQuery({
        queryKey: ['checkOneTimePremiumEligibility', planCode, policyNumber],
        queryFn: () =>
            checkOneTimePremiumEligibilityQuery(
                planCode as string,
                policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleOneTimePremium:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { isPermissioned: isUserPermissionedToAutopay } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );

    useEffect(() => {
        if (!isFetched) return;

        const isEligible =
            oneTimePremiumEligibility?.isEligibleOneTimePremium || false;
        const isPermissioned = isUserPermissionedToAutopay || false;

        if (!isEligible || !isPermissioned) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [oneTimePremiumEligibility, isUserPermissionedToAutopay, router]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <NewPremiumProvider>
            <PageHead titleKey="newPremium" />
            <NewPremiumContainer policy={policy} />
        </NewPremiumProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/premiums/new-premium',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/premiums/new-premium',
    }
);

export default NewPremium;
