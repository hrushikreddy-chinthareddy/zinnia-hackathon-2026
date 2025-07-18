import { skipToken, useQuery } from '@tanstack/react-query';
import {
    ArrangementType,
    FlatExtra,
    Policy,
    Reason,
} from '@zinnia/api-types/types/sor';
import { I18n, useTranslation } from 'next-i18next';
import { useContext } from 'react';

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
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { checkSystematicProgramEligibilityQuery } from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

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
    const { t } = useTranslation(undefined, {
        keyPrefix: 'withdrawals.upcoming',
    });
    const { policyDetails } = useContext(PolicyData);
    const { systematicPrograms } = policyDetails;
    const getPayout = (type: ArrangementType) => {
        return systematicPrograms.getNextProgramByType(type);
    };

    const { parties } = policy;
    const { planCode, policyNumber, isAnnuity } = policyDetails;

    const { featureFlags } = useOptimizely();

    const withdrawalEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_WITHDRAWAL_TRANSACTION];
    const rmdEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_RMD_TRANSACTION] && isAnnuity; // NOTE: Only annuities should display the RMD Withdrawal feature - MR

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

    const sideSheet = useSideSheetContext();
    const openCancelSideSheet = (type: string) => {
        const sideSheetTitle =
            type === ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                ? t('cancelWithdrawalAutopayTitle', { type: 'RMD' })
                : t('cancelWithdrawalAutopayTitle', { type: 'Withdrawal' });

        const arrangementType =
            type === ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                ? ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                : ArrangementType.WITHDRAWAL;
        const systematicProgramReason =
            type === ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                ? Reason.REQUIREDMINIMUMDISTRIBUTION
                : Reason.WITHDRAWAL;

        console.log(
            'getPayout(arrangementType)?.nextProgramDate',
            getPayout(arrangementType)?.nextProgramDate
        );
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

    return (
        <>
            <WithdrawalsPageHeaderContainer
                planCode={policyDetails.planCode}
                policyNumber={policyDetails.policyNumber}
            />
            <hr className="h-0.5 border-none bg-gray-200" />
            <WithdrawalRules policy={policy} policyDetails={policyDetails} />
            <hr className="h-0.5 border-none bg-gray-200" />
            {withdrawalEnabled && (
                <>
                    <UpcomingPaymentCard
                        title={`${t('withdrawalAutopay')}`}
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
                        footerLinks={[
                            {
                                href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/withdrawals/update-withdrawal-autopay?type=WITHDRAWAL`,
                                text: t('manageAutopay'),
                                isDisabled:
                                    !withdrawalEligibility?.isEligibleWithdrawal ||
                                    !withdrawalProgram?.nextProgramDate,
                                tooltip:
                                    withdrawalEligibility?.ineligibleWithdrawalReason,
                            },
                            {
                                href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/withdrawals/new-withdrawal-autopay`,
                                text: t('setUpAutopay'),
                                isDisabled:
                                    !withdrawalEligibility?.isEligibleWithdrawal ||
                                    !!withdrawalProgram?.nextProgramDate,
                                tooltip:
                                    withdrawalEligibility?.ineligibleWithdrawalReason,
                            },
                            {
                                href: '#',
                                text: t('cancelAutopay'),
                                onClick: () => {
                                    openCancelSideSheet(
                                        ArrangementType.WITHDRAWAL
                                    );
                                },
                                isDisabled:
                                    !withdrawalEligibility?.isEligibleWithdrawal ||
                                    !withdrawalProgram?.nextProgramDate,
                            },
                        ]}
                        displayCardWithZeroAmount={true}
                    />
                </>
            )}
            {rmdEnabled && (
                <>
                    <hr className="h-0.5 border-none bg-gray-200" />
                    <UpcomingPaymentCard
                        autopayAmount={rmdProgram?.amount}
                        title={`${t('rmdAutopay')}`}
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
                        titleCase={false}
                        footerLinks={[
                            {
                                href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/withdrawals/update-withdrawal-autopay?type=RMD`,
                                text: t('manageAutopay'),
                                isDisabled:
                                    !rmdEligibility?.isEligibleRmd ||
                                    !rmdProgram?.nextProgramDate,
                                tooltip: rmdEligibility?.ineligibleRmdReason,
                            },
                            {
                                href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/withdrawals/new-withdrawal-autopay`,
                                text: t('setUpAutopay'),
                                isDisabled:
                                    !rmdEligibility?.isEligibleRmd ||
                                    !!rmdProgram?.nextProgramDate,
                                tooltip: rmdEligibility?.ineligibleRmdReason,
                            },
                            {
                                href: '#',
                                text: t('cancelAutopay'),
                                onClick: () => {
                                    openCancelSideSheet(
                                        ArrangementType.REQUIREDMINIMUMDISTRIBUTION
                                    );
                                },
                                isDisabled:
                                    !rmdEligibility?.isEligibleRmd ||
                                    !rmdProgram?.nextProgramDate,
                            },
                        ]}
                        displayCardWithZeroAmount={false}
                    />
                </>
            )}
        </>
    );
};

export default WithdrawalsSubPage;
