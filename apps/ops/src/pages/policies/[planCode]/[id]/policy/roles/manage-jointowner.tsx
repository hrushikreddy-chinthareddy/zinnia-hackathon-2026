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

interface RoleProps {
    policy: Policy;
}

const JointOwner = ({ policy }: RoleProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber } = policy;
    const { planCode } = policy.product ?? {};

    const {
        data: manageJointOwnerEligibility,
        isFetched: isJointOwnerEligibilityFetched,
    } = useQuery({
        queryKey: ['checkManageJointOwnerEligibility', planCode, policyNumber],
        queryFn: () =>
            checkManagRoleEligibilityQuery(
                planCode ?? '',
                policyNumber ?? '',
                PolicyRole.JOINTOWNER
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => ({
            ...data,
            isEligibleManageJOINTOWNER:
                data?.status === TransactionResponseStatus.Success,
        }),
    });

    useEffect(() => {
        if (!isJointOwnerEligibilityFetched) return;

        const isEligible =
            manageJointOwnerEligibility?.isEligibleManageJOINTOWNER || false;

        if (!isEligible) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [manageJointOwnerEligibility, router, isJointOwnerEligibilityFetched]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <RoleChangeProvider>
            <PageHead titleKey="jointOwnerChange" />
            <RoleChangeContainer
                policy={policy}
                role={PolicyRole.JOINTOWNER}
                roleLabel={RoleLabel.JOINTOWNER}
            />
        </RoleChangeProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/roles/manage-jointowner',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/roles/manage-jointowner',
    }
);

export default JointOwner;
