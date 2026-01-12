import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import { PolicyRole, RoleLabel } from '@deps/constants/policy';
import RoleChangeContainer from '@deps/containers/role-change/role-change-container';
import { RoleChangeProvider } from '@deps/contexts/RoleChangeContext';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkManagRoleEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

interface IPayorProps {
    policy: Policy;
}

const PayorChange = ({ policy }: IPayorProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber } = policy;
    const { planCode } = policy.product ?? {};

    const {
        data: managePayorEligibility,
        isFetched: isPayorEligibilityFetched,
    } = useQuery({
        queryKey: ['checkManagePayorEligibility', planCode, policyNumber],
        queryFn: () =>
            checkManagRoleEligibilityQuery(
                planCode ?? '',
                policyNumber ?? '',
                PolicyRole.PAYOR
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => ({
            ...data,
            isEligibleManagePAYOR:
                data?.status === TransactionResponseStatus.Success,
        }),
    });

    useEffect(() => {
        if (!isPayorEligibilityFetched) return;

        const isEligible =
            managePayorEligibility?.isEligibleManagePAYOR || false;

        if (!isEligible) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [managePayorEligibility, router, isPayorEligibilityFetched]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <RoleChangeProvider>
            <PageHead titleKey="payorChange" />
            <RoleChangeContainer
                policy={policy}
                role={PolicyRole.PAYOR}
                roleLabel={RoleLabel.PAYOR}
            />
        </RoleChangeProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/roles/manage-payor',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/roles/manage-payor',
    }
);

export default PayorChange;
