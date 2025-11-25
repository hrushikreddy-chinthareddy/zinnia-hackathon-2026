import { skipToken, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useMemo, useContext } from 'react';

import SystematicProgramsCard from '@deps/components/card/card-systematic-programs/card-systematic-programs';
import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helpers';
import SideSheetCancelAutopay from '@deps/components/side-sheet/side-sheet-transaction/cancel-autopay/side-sheet-cancel-autopay';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helpers';
import {
    getBankDetails,
    getFlatExtra,
    getParty,
} from '@deps/helpers/payments.helpers';
import { getFrequency } from '@deps/helpers/systematic-program.helpers';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkLoanRepaymentOneTimeEligibilityQuery,
    checkSystematicProgramsEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { TransactionPermission } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    ArrangementType,
    Frequency,
    Policy,
    Reason,
    Status,
} from '@zinnia/api-types/types/sor';

import LoanRulesCard from './cards/loan-rules-card';
import OutstandingLoansCard from './cards/outstanding-loans-card';
import LoansPageHeaderContainer from '../page-header/loans-page-header';

interface LoansContainerProps {
    policy: Policy;
}

export const LoansSubPage = ({ policy }: LoansContainerProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'premium.upcoming',
    });
    const { t: defaultT } = useTranslation();
    const { featureFlags } = useOptimizely();
    const sideSheet = useSideSheetContext();

    const { policyDetails } = useContext(PolicyData);

    const loanPaymentEnabled =
        featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];
    const loanCancelEnabled = featureFlags[FEATURE_FLAGS.LOAN_CANCEL_AUTOPAY];
    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

    const {
        allocation,
        coverage,
        currency,
        loanValues,
        parties,
        policyNumber,
        product,
        systematicPrograms,
    } = policy;
    const { planCode } = product ?? {};

    const loanCarryingBalance =
        !!loanValues?.totalLoanBalance && loanValues?.totalLoanBalance > 0;
    const upcomingLoanRepayment = useMemo(
        () =>
            systematicPrograms?.find(
                (sp) =>
                    sp.reason === Reason.LOANREPAYMENT &&
                    sp.status === Status.ACTIVE
            ),
        [systematicPrograms]
    );

    const loanPrograms =
        systematicPrograms?.filter(
            (sp) => sp.arrangementType === ArrangementType.LOANREPAYMENT
        ) || [];

    const payorParty = getParty(parties, upcomingLoanRepayment);
    const payorBankDetails = getBankDetails(payorParty, upcomingLoanRepayment);

    const flatExtra = getFlatExtra(coverage);
    const addCharges = getAddCharges({
        flatExtra,
        keyPrefix: 'premium.upcoming',
        t,
    });

    const { data: loanRepaymentOneTimeEligibility } = useQuery({
        queryKey: [
            'checkLoanRepaymentOneTimeEligibility',
            planCode,
            policyNumber,
            policy.loanValues?.totalLoanBalance,
        ],
        queryFn: () =>
            checkLoanRepaymentOneTimeEligibilityQuery(
                planCode as string,
                policyNumber as string,
                policy.loanValues?.totalLoanBalance
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleLoanRepaymentOneTime:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: systematicProgramsEligibility } = useQuery({
        queryKey: [
            'checkSystematicProgramsEligibility',
            planCode,
            policyNumber,
            upcomingLoanRepayment?.arrangementId,
        ],
        queryFn: upcomingLoanRepayment?.arrangementId
            ? () =>
                  checkSystematicProgramsEligibilityQuery(
                      planCode as string,
                      policyNumber as string,
                      upcomingLoanRepayment?.arrangementId as string
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
    const { isPermissioned: isUserPermissionedToEditLoan } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );
    const openCancelSideSheet = () => {
        sideSheet.changeSideSheetContent(
            <Typography variant={TypographyVariant.H2}>
                {t('cancelLoanAutopayTitle')}
            </Typography>,
            <SideSheetCancelAutopay
                arrangementType={ArrangementType.LOANREPAYMENT}
                onCancel={() => sideSheet.handleOpen(false)}
                policy={policy}
                systematicProgramReason={Reason.LOANREPAYMENT}
            />
        );
        sideSheet.handleOpen(true);
    };
    const getLoanTooltip = () => {
        const permissionRequired =
            systematicProgramsEligibility?.isEligibleManageAutopay &&
            loanPaymentEnabled &&
            upcomingLoanRepayment?.nextProgramDate;

        if (permissionRequired) {
            return !isUserPermissionedToEditLoan
                ? t('transactions.permissionDeniedTooltip', {
                      carrier: policyDetails.carrierName,
                  })
                : undefined;
        }

        return formatValidationResult(
            systematicProgramsEligibility?.validationResult
        );
    };
    const getLoanTooltipsetUpAutoPay = () => {
        return !isUserPermissionedToEditLoan
            ? t('transactions.permissionDeniedTooltip', {
                  carrier: policyDetails.carrierName,
              })
            : undefined;
    };

    const getOneTimeLoanTooltip = () => {
        const permissionRequired =
            loanRepaymentOneTimeEligibility?.isEligibleLoanRepaymentOneTime;

        if (permissionRequired) {
            return !isUserPermissionedToEditLoan
                ? t('transactions.permissionDeniedTooltip', {
                      carrier: policyDetails.carrierName,
                  })
                : undefined;
        }

        return formatValidationResult(
            loanRepaymentOneTimeEligibility?.validationResult
        );
    };

    const loanSetAutopay = {
        href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/start-loan-payment`,
        text: t('setUpAutopay'),
        isDisabled:
            !loanPaymentEnabled ||
            upcomingLoanRepayment?.nextProgramDate !== undefined ||
            !isUserPermissionedToEditLoan,
        tooltip: getLoanTooltipsetUpAutoPay(),
    };

    const loanManageAutopay = {
        href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/manage-loan-payment`,
        text: t('manageAutopay'),
        isDisabled:
            !loanPaymentEnabled ||
            !systematicProgramsEligibility?.isEligibleManageAutopay ||
            !upcomingLoanRepayment?.nextProgramDate ||
            !isUserPermissionedToEditLoan,
        tooltip: getLoanTooltip(),
    };

    const loanCancelAutopay = {
        href: '#',
        isDisabled:
            !loanCancelEnabled ||
            !loanPaymentEnabled ||
            !upcomingLoanRepayment?.nextProgramDate ||
            !isUserPermissionedToEditLoan,
        text: t('cancelAutopay'),
        onClick: openCancelSideSheet,
    };

    return (
        <>
            <LoansPageHeaderContainer
                loanCarryingBalance={loanCarryingBalance}
                policy={policy}
            />
            <hr className="h-0.5 border-none bg-gray-200" />
            {!systematicProgramTablesEnabled && !!loanCarryingBalance && (
                <UpcomingPaymentCard
                    className="content-divider"
                    autopayAmount={upcomingLoanRepayment?.amount}
                    paymentDate={upcomingLoanRepayment?.nextProgramDate}
                    bankDetails={payorBankDetails}
                    additionalCharges={addCharges}
                    paymentFrequencyText={
                        t('paymentFrequencyText', {
                            paymentMode: getFrequency(
                                upcomingLoanRepayment?.frequency as Frequency,
                                defaultT
                            ),
                            paymentType: t('paymentType.loan'),
                        }) || undefined
                    }
                    paymentDateText={
                        (!!upcomingLoanRepayment?.nextProgramDate &&
                            t('paymentDateText')) ||
                        undefined
                    }
                    footerLinks={[
                        loanSetAutopay,
                        loanManageAutopay,
                        loanCancelAutopay,
                        {
                            href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/loan-payment`,
                            text: t('oneTimePaymentText'),
                            isDisabled:
                                !loanRepaymentOneTimeEligibility?.isEligibleLoanRepaymentOneTime ||
                                !isUserPermissionedToEditLoan,
                            tooltip: getOneTimeLoanTooltip(),
                        },
                    ]}
                    requestSubTypes={[
                        'Setup Loan Repayment',
                        'Update Loan Repayment',
                    ]}
                    hasProgram={!!upcomingLoanRepayment}
                />
            )}
            {systematicProgramTablesEnabled && (
                <SystematicProgramsCard
                    title="Systematic Programs"
                    programs={[
                        {
                            arrangementType: ArrangementType.LOANREPAYMENT,
                            activePrograms: loanPrograms.filter(
                                (program) => program.status === Status.ACTIVE
                            ),
                            terminatedOrSuspendedPrograms: loanPrograms.filter(
                                (program) =>
                                    program.status === Status.TERMINATED ||
                                    program.status === Status.SUSPENDED
                            ),
                            manageAction: loanManageAutopay,
                            cancelAction: loanCancelAutopay,
                        },
                    ]}
                    setUpAction={loanSetAutopay}
                />
            )}
            <hr className="h-0.5 border-none bg-gray-200" />
            <LoanRulesCard currency={currency} loanValues={loanValues} />
            <OutstandingLoansCard
                currency={currency}
                lastLoanInterestDueDate={loanValues?.lastLoanInterestDueDate}
                loanSegments={allocation?.loanSegments}
            />
        </>
    );
};

export default LoansSubPage;
