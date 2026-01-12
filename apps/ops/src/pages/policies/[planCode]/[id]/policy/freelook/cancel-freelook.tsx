import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import FreeLookCancelContainer from '@deps/containers/financial-transactions/free-look-cancel/free-look-cancel-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { WithdrawalProvider } from '@deps/contexts/transactions/WithdrawalContext';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionPermission } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

const CancelFreeLook = ({ policy }: { policy: Policy }) => {
    const router = useRouter();
    const { featureFlags } = useOptimizely();

    const freeLookEnabled =
        featureFlags[FEATURE_FLAGS.POLICY_FREE_LOOK_CANCELLATION];

    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber } = policy;
    const { planCode } = policy.product ?? {};

    const {
        isPermissioned: isUserPermissionedToWithdraw,
        isLoading: isPermissionCheckLoading,
    } = useTransactionPermissionCheck(
        TransactionPermission.WritePolicy,
        policyNumber,
        planCode
    );

    useEffect(() => {
        if (isPermissionCheckLoading) return;

        if (!freeLookEnabled || !isUserPermissionedToWithdraw) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [
        freeLookEnabled,
        isUserPermissionedToWithdraw,
        router,
        isPermissionCheckLoading,
    ]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <WithdrawalProvider>
            <PageHead titleKey="cancelFreeLook" />
            <FreeLookCancelContainer policy={policy} />
        </WithdrawalProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/freelook/cancel-freelook',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/freelook/cancel-freelook',
    }
);

export default CancelFreeLook;
