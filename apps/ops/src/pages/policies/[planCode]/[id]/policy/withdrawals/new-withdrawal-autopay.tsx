import { skipToken, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import AutopayContainer from '@deps/containers/financial-transactions/autopay/autopay-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { AutopayProvider } from '@deps/contexts/transactions/AutopayContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helpers';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { Status } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkSystematicProgramEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { TransactionPermission } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { getServerSidePropsPolicyDetailsPage } from '@deps/utils/page';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
import { ArrangementType, Policy, Reason } from '@zinnia/api-types/types/sor';

export interface WithdrawalAutopayProps {
    policy: Policy;
}

enum ProgramType {
    RMD = 'RMD',
}

const NewWithdrawalAutoPay = ({ policy }: WithdrawalAutopayProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const { type } = router.query;

    const arrangementType =
        type === ProgramType.RMD
            ? ArrangementType.REQUIREDMINIMUMDISTRIBUTION
            : ArrangementType.WITHDRAWAL;
    const reason =
        type === ProgramType.RMD
            ? Reason.REQUIREDMINIMUMDISTRIBUTION
            : Reason.WITHDRAWAL;

    const { policyNumber, systematicPrograms } = policy;
    const { planCode } = policy.product ?? {};

    const withdrawalProgram = useMemo(
        () =>
            systematicPrograms?.find(
                (sp) =>
                    sp.reason === Reason.WITHDRAWAL &&
                    sp.status === Status.ACTIVE
            ),
        [systematicPrograms]
    );

    const rmdProgram = useMemo(
        () =>
            systematicPrograms?.find(
                (sp) =>
                    sp.reason === Reason.REQUIREDMINIMUMDISTRIBUTION &&
                    sp.status === Status.ACTIVE
            ),
        [systematicPrograms]
    );

    const { featureFlags } = useOptimizely();
    const withdrawalEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_WITHDRAWAL_TRANSACTION];

    const rmdEnabled = featureFlags[FEATURE_FLAGS.SYSTEMATIC_RMD_TRANSACTION];

    const {
        data: withdrawalEligibility,
        isFetched: isPartialWithdrawalOneTimeEligibilityFetched,
    } = useQuery({
        queryKey: [
            'checkEligibilityWithdrawal',
            planCode,
            policyNumber,
            withdrawalProgram?.arrangementId,
        ],
        queryFn:
            withdrawalEnabled && planCode && policyNumber
                ? () =>
                      checkSystematicProgramEligibilityQuery(
                          planCode,
                          policyNumber,
                          withdrawalProgram?.arrangementId ?? '',
                          {
                              systematicProgram: {
                                  arrangementType: ArrangementType.WITHDRAWAL,
                              },
                          }
                      )
                : skipToken,
        select: (data) => ({
            isEligibleWithdrawal:
                data?.status === TransactionResponseStatus.Success,
            ineligibleWithdrawalReason: formatValidationResult(
                data?.validationResult
            ),
        }),
    });

    const { data: rmdEligibility, isFetched: isRmdEligibilityFetched } =
        useQuery({
            queryKey: [
                'checkEligibilityRmd',
                planCode,
                policyNumber,
                rmdProgram?.arrangementId,
            ],
            queryFn:
                planCode && policyNumber && rmdEnabled
                    ? () =>
                          checkSystematicProgramEligibilityQuery(
                              planCode,
                              policyNumber,
                              rmdProgram?.arrangementId ?? '',
                              {
                                  systematicProgram: {
                                      arrangementType:
                                          ArrangementType.REQUIREDMINIMUMDISTRIBUTION,
                                  },
                              }
                          )
                    : skipToken,
            select: (data) => ({
                isEligibleRmd:
                    data?.status === TransactionResponseStatus.Success,
                ineligibleRmdReason: formatValidationResult(
                    data?.validationResult
                ),
            }),
        });

    const { isPermissioned: isUserPermissionedToWithdraw } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );

    useEffect(() => {
        if (
            !isPartialWithdrawalOneTimeEligibilityFetched ||
            !isRmdEligibilityFetched
        )
            return;

        const isEligible = withdrawalEligibility?.isEligibleWithdrawal || false;
        const isRmdEligible = rmdEligibility?.isEligibleRmd || false;

        if ((!isEligible && !isRmdEligible) || !isUserPermissionedToWithdraw) {
            router.replace('/403');
        } else {
            setIsLoading(false);
        }
    }, [
        planCode,
        policyNumber,
        withdrawalEligibility,
        rmdEligibility,
        isUserPermissionedToWithdraw,
        router,
        isRmdEligibilityFetched,
        isPartialWithdrawalOneTimeEligibilityFetched,
        type,
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
                isSetUp={true}
            />
        </AutopayProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: getServerSidePropsPolicyDetailsPage,
    },
    {
        file: 'policies/[planCode]/[id]/policy/withdrawals/new-withdrawal-autopay',
        function: 'getServerSideProps',
        page: 'policies/:planCode/:id/policy/withdrawals/new-withdrawal-autopay',
    }
);

export default NewWithdrawalAutoPay;
