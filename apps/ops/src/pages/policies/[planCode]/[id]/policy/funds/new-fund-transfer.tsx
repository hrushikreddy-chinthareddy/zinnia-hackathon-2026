import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import FundTransferContainer from '@deps/containers/financial-transactions/fund-transfer/fund-transfer-container';
import { FundTransferProvider } from '@deps/contexts/transactions/FundTransferContext';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkEligibilityFundAllocation } from '@deps/queries/api/fund-allocation';
import { checkEligibilityFundTransfer } from '@deps/queries/api/fund-transfer';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

interface fundProps {
    policy: Policy;
}

const FundTransfer = ({ policy }: fundProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const checkFundAllocationEligibility = useCallback(async () => {
        const response = await checkEligibilityFundAllocation(
            policy.product?.planCode,
            policy.policyNumber
        );
        return response?.status === 'success';
    }, [policy.product?.planCode, policy.policyNumber]);

    const checkFundTransferEligibility = useCallback(async () => {
        const response = await checkEligibilityFundTransfer(
            policy.product?.planCode,
            policy.policyNumber
        );
        return response?.status === TransactionResponseStatus.Success;
    }, [policy.product?.planCode, policy.policyNumber]);

    useEffect(() => {
        const checkEligibility = async () => {
            try {
                const [isAllocationEligible, isTransferEligible] =
                    await Promise.all([
                        checkFundAllocationEligibility(),
                        checkFundTransferEligibility(),
                    ]);

                if (!isAllocationEligible || !isTransferEligible) {
                    router.replace('/403');
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                router.replace('/403');
            }
        };

        checkEligibility();
    }, [checkFundAllocationEligibility, checkFundTransferEligibility]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <FundTransferProvider>
            <PageHead titleKey="fundTransfer" />
            <FundTransferContainer policy={policy} />
        </FundTransferProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/funds/new-fund-transfer',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/funds/new-fund-transfer',
    }
);

export default FundTransfer;
