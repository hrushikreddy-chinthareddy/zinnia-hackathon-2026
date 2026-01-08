import { useQuery } from '@tanstack/react-query';
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
import { Policy } from '@zinnia/api-types/types/sor';

interface IThirdPartyProps {
    policy: Policy;
}

const ThirdPartyChange = ({ policy }: IThirdPartyProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber } = policy;
    const { planCode } = policy.product ?? {};

    const {
        data: manageThirdPartyEligibility,
        isFetched: isThirdPartyEligibilityFetched,
    } = useQuery({
        queryKey: ['checkManageThirdPartyEligibility', planCode, policyNumber],
        queryFn: () =>
            checkManagRoleEligibilityQuery(
                planCode ?? '',
                policyNumber ?? '',
                PolicyRole.THIRDPARTYDESIGNEE
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => ({
            ...data,
            isEligibleManageTHIRDPARTYDESIGNEE:
                data?.status === TransactionResponseStatus.Success,
        }),
    });

    useEffect(() => {
        if (!isThirdPartyEligibilityFetched) return;

        const isEligible =
            manageThirdPartyEligibility?.isEligibleManageTHIRDPARTYDESIGNEE ||
            false;

        if (!isEligible) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [manageThirdPartyEligibility, router, isThirdPartyEligibilityFetched]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <RoleChangeProvider>
            <PageHead titleKey="thirdPartyDesigneeChange" />
            <RoleChangeContainer
                policy={policy}
                role={PolicyRole.THIRDPARTYDESIGNEE}
                roleLabel={RoleLabel.THIRDPARTYDESIGNEE}
            />
        </RoleChangeProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/roles/manage-third-party-designee',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/roles/manage-third-party-designee',
    }
);

export default ThirdPartyChange;
