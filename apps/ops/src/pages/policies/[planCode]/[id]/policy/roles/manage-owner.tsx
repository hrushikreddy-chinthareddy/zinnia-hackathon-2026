import { useQuery } from '@tanstack/react-query';
import { Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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

interface fundProps {
    policy: Policy;
}

const OwnerChange = ({ policy }: fundProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber } = policy;
    const { planCode } = policy.product ?? {};

    const {
        data: manageOwnerEligibility,
        isFetched: isOwnerEligibilityFetched,
    } = useQuery({
        queryKey: ['checkManageOwnerEligibility', planCode, policyNumber],
        queryFn: () =>
            checkManagRoleEligibilityQuery(
                planCode ?? '',
                policyNumber ?? '',
                PolicyRole.OWNER
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => ({
            ...data,
            isEligibleManageOWNER:
                data?.status === TransactionResponseStatus.Success,
        }),
    });

    useEffect(() => {
        if (!isOwnerEligibilityFetched) return;

        const isEligible =
            manageOwnerEligibility?.isEligibleManageOWNER || false;

        if (!isEligible) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [manageOwnerEligibility, router, isOwnerEligibilityFetched]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <RoleChangeProvider>
            <PageHead titleKey="ownerChange" />
            <RoleChangeContainer
                policy={policy}
                role={PolicyRole.OWNER}
                roleLabel={RoleLabel.OWNER}
            />
        </RoleChangeProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/roles/manage-owner',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/roles/manage-owner',
    }
);

export default OwnerChange;
