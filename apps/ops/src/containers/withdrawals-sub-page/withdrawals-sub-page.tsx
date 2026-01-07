import { skipToken, useQuery } from '@tanstack/react-query';
import { I18n, useTranslation } from 'next-i18next';
import { useContext } from 'react';

import SystematicProgramsCard from '@deps/components/card/card-systematic-programs/card-systematic-programs';
import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helpers';
import SideSheetCancelAutopay from '@deps/components/side-sheet/side-sheet-transaction/cancel-autopay/side-sheet-cancel-autopay';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WithdrawalsPageHeaderContainer from '@deps/containers/page-header/withdrawals-page-header';
import WithdrawalRules from '@deps/containers/withdrawal-rules/withdrawal-rules';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helpers';
import {
    getBankDetails,
    getFlatExtra,
    getParty,
} from '@deps/helpers/payments.helpers';
import { TempAnnuityArrangementTypes } from '@deps/helpers/policy-sor/SystematicPrograms';
import { getFrequency } from '@deps/helpers/systematic-program.helpers';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkSystematicProgramEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { TransactionPermission } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    ArrangementType,
    FlatExtra,
    Frequency,
    Policy,
    Reason,
    Status,
} from '@zinnia/api-types/types/sor';

import { BPMErrorContent } from './bpm-error-content';

interface WithdrawalsSubPageProps {
    policy: Policy;
}

export interface AddChargesProps {
    flatExtra?: FlatExtra[];
    keyPrefix: string;
    t: I18n['t'];
}

const WithdrawalsSubPage = ({ policy }: WithdrawalsSubPageProps) => {
    const { t } = useTranslation();
    const { policyDetails } = useContext(PolicyData);

    const { systematicPrograms } = policyDetails;
    const getPayout = (type: ArrangementType) => {
        return systematicPrograms.getNextProgramByType(type);
    };

    const { parties } = policy;
    const { planCode, policyNumber, isAnnuity, isLife } = policyDetails;

    const { featureFlags } = useOptimizely();

    const withdrawalEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_WITHDRAWAL_TRANSACTION];
    const rmdEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_RMD_TRANSACTION] && isAnnuity; // NOTE: Only annuities should display the RMD Withdrawal feature - MR
    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

    const allRmdPrograms =
        systematicPrograms.all.filter(
            (sp) =>
                sp.arrangementType ===
                ArrangementType.REQUIREDMINIMUMDISTRIBUTION
        ) || [];

    const allWithdrawalPrograms =
        systematicPrograms.all.filter(
            (sp) => sp.arrangementType === ArrangementType.WITHDRAWAL
        ) || [];

    const rmdPrograms = policyDetails.systematicPrograms.getProgramsByType(
        ArrangementType.REQUIREDMINIMUMDISTRIBUTION
    );
    const withdrawalprograms =
        policyDetails.systematicPrograms.getProgramsByType(
            ArrangementType.WITHDRAWAL
        );

    //TODO: remove these lines below when lifeCAD fixes the arrangementType values they are sending back to us.
    const [rmdProgram] = rmdPrograms.length
        ? rmdPrograms
        : policyDetails.systematicPrograms.getProgramsByType(
              TempAnnuityArrangementTypes.REQUIREDMINIMUMDISTRIBUTION
          );
    const [withdrawalProgram] = withdrawalprograms.length
        ? withdrawalprograms
        : policyDetails.systematicPrograms.getProgramsByType(
              TempAnnuityArrangementTypes.WITHDRAWAL
          );
    const hasWithdrawalProgram =
        !!withdrawalProgram && withdrawalProgram.arrangementId !== undefined;
    const hasRmdProgram =
        !!rmdProgram && rmdProgram.arrangementId !== undefined;

    const { data: withdrawalEligibility } = useQuery({
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

    const { data: rmdEligibility } = useQuery({
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
            isEligibleRmd: data?.status === TransactionResponseStatus.Success,
            ineligibleRmdReason: formatValidationResult(data?.validationResult),
        }),
    });

    const getWithdrawalTooltip = () => {
        const permissionRequired =
            withdrawalEligibility?.isEligibleWithdrawal &&
            withdrawalProgram?.nextProgramDate;

        if (permissionRequired) {
            return !isUserPermissionedToWithdraw
                ? t(
                      'withdrawals.upcoming.transactions.permissionDeniedTooltip',
                      {
                          carrier: policyDetails.carrierName,
                      }
                  )
                : undefined;
        }

        return withdrawalEligibility?.ineligibleWithdrawalReason;
    };

    const getRmdTooltip = () => {
        const permissionRequired =
            rmdEligibility?.isEligibleRmd && rmdProgram?.nextProgramDate;

        if (permissionRequired) {
            return !isUserPermissionedToWithdraw
                ? t(
                      'withdrawals.upcoming.transactions.permissionDeniedTooltip',
                      {
                          carrier: policyDetails.carrierName,
                      }
                  )
                : undefined;
        }

        return rmdEligibility?.ineligibleRmdReason;
    };

    const sideSheet = useSideSheetContext();
    const openCancelSideSheet = (type: string) => {
        const sideSheetTitle =
            type === ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                ? t('withdrawals.upcoming.cancelWithdrawalAutopayTitle', {
                      type: 'RMD',
                  })
                : t('withdrawals.upcoming.cancelWithdrawalAutopayTitle', {
                      type: 'Withdrawal',
                  });

        const arrangementType =
            type === ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                ? ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                : ArrangementType.WITHDRAWAL;
        const systematicProgramReason =
            type === ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                ? Reason.REQUIREDMINIMUMDISTRIBUTION
                : Reason.WITHDRAWAL;
        sideSheet.changeSideSheetContent(
            <Typography variant={TypographyVariant.H2}>
                {sideSheetTitle}
            </Typography>,
            <SideSheetCancelAutopay
                arrangementType={arrangementType}
                onCancel={() => sideSheet.handleOpen(false)}
                policy={policy}
                systematicProgramReason={systematicProgramReason}
                isFromWithdrawals={true}
                errorContent={<BPMErrorContent type={arrangementType} />}
                date={getPayout(arrangementType)?.nextProgramDate}
            />
        );
        sideSheet.handleOpen(true);
    };
    const { isPermissioned: isUserPermissionedToWithdraw } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );

    const withdrawManageAutopay = {
        href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/withdrawals/update-withdrawal-autopay?type=WITHDRAWAL`,
        text: t('allFields.manageAutopay'),
        isDisabled:
            !withdrawalEligibility?.isEligibleWithdrawal ||
            !withdrawalProgram?.nextProgramDate ||
            !isUserPermissionedToWithdraw,
        tooltip: getWithdrawalTooltip(),
    };
    const withdrawCancelAutopay = {
        href: '',
        text: t('allFields.cancelAutopay'),
        onClick: (e?: React.MouseEvent) => {
            e && e.preventDefault();
            openCancelSideSheet(ArrangementType.WITHDRAWAL);
        },
        isDisabled:
            !withdrawalEligibility?.isEligibleWithdrawal ||
            !withdrawalProgram?.nextProgramDate ||
            !isUserPermissionedToWithdraw,
    };
    const withdrawSetUpAction = {
        href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/withdrawals/new-withdrawal-autopay`,
        text: t('allFields.setUpAutopay'),
        isDisabled:
            !withdrawalEligibility?.isEligibleWithdrawal ||
            !withdrawalProgram?.nextProgramDate ||
            !isUserPermissionedToWithdraw,
        tooltip: getWithdrawalTooltip(),
    };
    const withdrawFooterLinks = [
        withdrawManageAutopay,
        withdrawSetUpAction,
        withdrawCancelAutopay,
    ];

    const rmdManageAutopay = {
        href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/withdrawals/update-withdrawal-autopay?type=RMD`,
        text: t('allFields.manageAutopay'),
        isDisabled:
            !rmdEligibility?.isEligibleRmd ||
            !rmdProgram?.nextProgramDate ||
            !isUserPermissionedToWithdraw,
        tooltip: getRmdTooltip(),
    };
    const rmdCancelAutopay = {
        href: '',
        text: t('allFields.cancelAutopay'),
        onClick: (e?: React.MouseEvent) => {
            e && e.preventDefault();
            openCancelSideSheet(ArrangementType.REQUIREDMINIMUMDISTRIBUTION);
        },
        isDisabled:
            !rmdEligibility?.isEligibleRmd ||
            !rmdProgram?.nextProgramDate ||
            !isUserPermissionedToWithdraw,
    };
    const rmdSetUpAction = {
        href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/withdrawals/new-withdrawal-autopay`,
        text: t('allFields.setUpAutopay'),
        isDisabled:
            !rmdEligibility?.isEligibleRmd ||
            !!rmdProgram?.nextProgramDate ||
            !isUserPermissionedToWithdraw,
        tooltip: getRmdTooltip(),
    };
    const rmdFooterLinks = [rmdManageAutopay, rmdSetUpAction, rmdCancelAutopay];

    const setUpAutopay = {
        ...withdrawSetUpAction,
        isDisabled: withdrawSetUpAction.isDisabled && rmdSetUpAction.isDisabled,
    };

    return (
        <>
            <WithdrawalsPageHeaderContainer
                planCode={policyDetails.planCode}
                policyNumber={policyDetails.policyNumber}
            />
            <hr className="h-0.5 border-none bg-gray-200" />
            <WithdrawalRules policy={policy} policyDetails={policyDetails} />
            <hr className="h-0.5 border-none bg-gray-200" />
            {!systematicProgramTablesEnabled && withdrawalEnabled && (
                <>
                    <UpcomingPaymentCard
                        title={`${t('withdrawals.upcoming.withdrawalAutopay')}`}
                        titleCase={false}
                        autopayAmount={withdrawalProgram?.amount}
                        paymentDate={withdrawalProgram?.nextProgramDate}
                        bankDetails={getBankDetails(
                            getParty(parties, withdrawalProgram),
                            withdrawalProgram
                        )}
                        additionalCharges={getAddCharges({
                            flatExtra: getFlatExtra(policy.coverage),
                            t,
                            keyPrefix: 'withdrawals.upcoming',
                        })}
                        paymentFrequencyText={
                            t('withdrawals.upcoming.paymentFrequencyText', {
                                paymentMode: getFrequency(
                                    withdrawalProgram?.frequency as Frequency,
                                    t
                                ),
                                paymentType: t(
                                    'withdrawals.upcoming.paymentType.payment'
                                ),
                            }) || undefined
                        }
                        footerLinks={withdrawFooterLinks}
                        displayCardWithZeroAmount={true}
                        hasProgram={hasWithdrawalProgram}
                    />
                </>
            )}
            {!systematicProgramTablesEnabled && rmdEnabled && (
                <>
                    <hr className="h-0.5 border-none bg-gray-200" />
                    <UpcomingPaymentCard
                        autopayAmount={rmdProgram?.amount}
                        title={`${t('withdrawals.upcoming.rmdAutopay')}`}
                        paymentDate={rmdProgram?.nextProgramDate}
                        bankDetails={getBankDetails(
                            getParty(parties, rmdProgram),
                            rmdProgram
                        )}
                        additionalCharges={getAddCharges({
                            flatExtra: getFlatExtra(policy.coverage),
                            t,
                            keyPrefix: 'withdrawals.upcoming',
                        })}
                        paymentFrequencyText={
                            t('withdrawals.upcoming.paymentFrequencyText', {
                                paymentMode: getFrequency(
                                    rmdProgram?.frequency as Frequency,
                                    t
                                ),
                                paymentType: t(
                                    'withdrawals.upcoming.paymentType.payment'
                                ),
                            }) || undefined
                        }
                        titleCase={false}
                        footerLinks={rmdFooterLinks}
                        displayCardWithZeroAmount={true}
                        hasProgram={hasRmdProgram}
                    />
                </>
            )}
            {systematicProgramTablesEnabled && (
                <SystematicProgramsCard
                    programs={[
                        {
                            arrangementType: ArrangementType.WITHDRAWAL,
                            activePrograms: allWithdrawalPrograms.filter(
                                (program) => program.status === Status.ACTIVE
                            ),
                            terminatedOrSuspendedPrograms:
                                allWithdrawalPrograms.filter(
                                    (program) =>
                                        program.status === Status.TERMINATED ||
                                        program.status === Status.SUSPENDED
                                ),
                            manageAction: withdrawManageAutopay,
                            cancelAction: withdrawCancelAutopay,
                        },
                        {
                            arrangementType:
                                ArrangementType.REQUIREDMINIMUMDISTRIBUTION,
                            activePrograms: allRmdPrograms.filter(
                                (program) => program.status === Status.ACTIVE
                            ),
                            terminatedOrSuspendedPrograms:
                                allRmdPrograms.filter(
                                    (program) =>
                                        program.status === Status.TERMINATED ||
                                        program.status === Status.SUSPENDED
                                ),
                            manageAction: rmdManageAutopay,
                            cancelAction: rmdCancelAutopay,
                        },
                    ]}
                    setUpAction={setUpAutopay}
                    isLife={isLife}
                />
            )}
        </>
    );
};

export default WithdrawalsSubPage;
