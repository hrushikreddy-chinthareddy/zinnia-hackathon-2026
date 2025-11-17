import { useQuery } from '@tanstack/react-query';
import { TransactionPermission } from '@xd/utils/dist';
import { ArrangementType, Policy, Reason } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import {
    PageLoader,
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkFullSurrenderWithdrawal,
    checkPartialWithdrawalOneTimeEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

export interface WithdrawalAutopayProps {
    policy: Policy;
}

const UpdateWithdrawalAutoPay = ({ policy }: WithdrawalAutopayProps) => {
    const router = useRouter();
    const { type } = router.query;

    const arrangementType =
        type === 'RMD'
            ? ArrangementType.REQUIREDMINIMUMDISTRIBUTION
            : ArrangementType.WITHDRAWAL;
    const reason =
        type === 'RMD' ? Reason.REQUIREDMINIMUMDISTRIBUTION : Reason.WITHDRAWAL;

    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber } = policy;
    const { planCode } = policy.product ?? {};

    const {
        data: partialWithdrawalOneTimeEligibility,
        isFetched: isPartialWithdrawalOneTimeEligibilityFetched,
    } = useQuery({
        queryKey: [
            'checkPartialWithdrawalOneTimeEligibility',
            planCode,
            policyNumber,
        ],
        queryFn: () =>
            checkPartialWithdrawalOneTimeEligibilityQuery(
                planCode as string,
                policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligiblePartialWithdrawalOneTime:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { isPermissioned: isUserPermissionedToWithdraw } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );

    const {
        data: fullSurrenderEligibility,
        isFetched: isFullSurrenderEligibilityFetched,
    } = useQuery({
        queryKey: ['checkFullSurrenderEligibility', planCode, policyNumber],
        queryFn: () =>
            checkFullSurrenderWithdrawal(
                planCode as string,
                policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleFullSurrender:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    useEffect(() => {
        if (
            !isPartialWithdrawalOneTimeEligibilityFetched ||
            !isFullSurrenderEligibilityFetched
        )
            return;

        const isEligible =
            partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime ||
            false;
        const isEligibleFullSurrender =
            fullSurrenderEligibility?.isEligibleFullSurrender || false;

        const isPermissioned = isUserPermissionedToWithdraw || false;

        if (!isEligible || !isEligibleFullSurrender || !isPermissioned) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [
        partialWithdrawalOneTimeEligibility,
        isUserPermissionedToWithdraw,
        router,
        fullSurrenderEligibility,
        isPartialWithdrawalOneTimeEligibilityFetched,
        isFullSurrenderEligibilityFetched,
    ]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <AutopayProvider>
            <PageHead titleKey="newWithdrawal" />
            <AutopayContainer
                arrangementType={arrangementType}
                policy={policy}
                parentPage={ParentPage.Withdrawals}
                systematicProgramReason={reason}
                translationKeyPrefix="withdrawalAutopay"
                isSetUp={false}
            />
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/withdrawals/update-withdrawal-autopay',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/withdrawals/update-withdrawal-autopay',
    }
);

export default UpdateWithdrawalAutoPay;
