import { skipToken, useQuery } from '@tanstack/react-query';
import { TransactionPermission } from '@xd/utils/dist';
import {
    ArrangementType,
    Policy,
    Reason,
    Status,
} from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkSystematicProgramsEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';

interface UpdateAutopayProps {
    policy: Policy;
}

const UpdateAutopay = ({ policy }: UpdateAutopayProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const { systematicPrograms, policyNumber } = policy;
    const { planCode } = policy.product ?? {};

    const upcomingPayment = useMemo(
        () =>
            systematicPrograms?.find(
                (sp) =>
                    sp.reason === Reason.PREMIUM && sp.status === Status.ACTIVE
            ),
        [systematicPrograms]
    );

    const { data: systematicProgramsEligibility, isFetched } = useQuery({
        queryKey: [
            'checkSystematicProgramsEligibility',
            planCode,
            policyNumber,
            upcomingPayment?.arrangementId,
        ],
        queryFn: upcomingPayment?.arrangementId
            ? () =>
                  checkSystematicProgramsEligibilityQuery(
                      planCode as string,
                      policyNumber as string,
                      upcomingPayment?.arrangementId as string
                  )
            : skipToken,
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleManageAutopay:
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
            systematicProgramsEligibility?.isEligibleManageAutopay || false;
        const isPermissioned = isUserPermissionedToAutopay || false;

        if (!isEligible || !isPermissioned) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [
        systematicProgramsEligibility,
        isUserPermissionedToAutopay,
        router,
        isFetched,
    ]);

    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }

    return (
        <AutopayProvider>
            <PageHead titleKey="updatePremium" />
            <AutopayContainer
                policy={policy}
                arrangementType={ArrangementType.PAYMENT}
                parentPage={ParentPage.Premiums}
                systematicProgramReason={Reason.PREMIUM}
                translationKeyPrefix="premiumAutopay"
            />
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/premiums/update-premium-autopay',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/premiums/update-premium-autopay',
    }
);

export default UpdateAutopay;
