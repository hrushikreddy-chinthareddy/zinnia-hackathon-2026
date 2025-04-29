import { skipToken, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helper';
import SideSheetCancelAutopay from '@deps/components/side-sheet/side-sheet-transaction/cancel-autopay/side-sheet-cancel-autopay';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { getBankDetails, getFlatExtra, getParty } from '@deps/helpers/payments.helper';
import { getFrequency } from '@deps/helpers/systematic-program.helper';
import { ArrangementType, Frequency, Policy, Reason } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkLoanRepaymentOneTimeEligibilityQuery,
    checkSystematicProgramsEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

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

    const loanPaymentEnabled = featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];
    const loanCancelEnabled = featureFlags[FEATURE_FLAGS.LOAN_CANCEL_AUTOPAY];

    const { allocation, coverage, currency, loanValues, parties, policyNumber, product, systematicPrograms } = policy;
    const { planCode } = product ?? {};

    const loanCarryingBalance = !!loanValues?.totalLoanBalance && loanValues?.totalLoanBalance > 0;
    const upcomingLoanRepayment = useMemo(
        () => systematicPrograms?.find(({ reason }) => reason === Reason.LOANREPAYMENT),
        [systematicPrograms]
    );

    const payorParty = getParty(parties, upcomingLoanRepayment);
    const payorBankDetails = getBankDetails(payorParty, upcomingLoanRepayment);

    const flatExtra = getFlatExtra(coverage);
    const addCharges = getAddCharges({ flatExtra, t });

    const { data: loanRepaymentOneTimeEligibility } = useQuery({
        queryKey: ['checkLoanRepaymentOneTimeEligibility', planCode, policyNumber, policy.loanValues?.totalLoanBalance],
        queryFn: () =>
            checkLoanRepaymentOneTimeEligibilityQuery(planCode as string, policyNumber as string, policy.loanValues?.totalLoanBalance),
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleLoanRepaymentOneTime: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: systematicProgramsEligibility } = useQuery({
        queryKey: ['checkSystematicProgramsEligibility', planCode, policyNumber, upcomingLoanRepayment?.arrangementId],
        queryFn: upcomingLoanRepayment?.arrangementId
            ? () =>
                  checkSystematicProgramsEligibilityQuery(
                      planCode as string,
                      policyNumber as string,
                      upcomingLoanRepayment?.arrangementId as string
                  )
            : skipToken,
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleManageAutopay: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const openCancelSideSheet = () => {
        sideSheet.changeSideSheetContent(
            <Typography variant={TypographyVariant.H2}>{t('cancelLoanAutopayTitle')}</Typography>,
            <SideSheetCancelAutopay
                arrangementType={ArrangementType.LOANREPAYMENT}
                onCancel={() => sideSheet.handleOpen(false)}
                policy={policy}
                systematicProgramReason={Reason.LOANREPAYMENT}
            />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <>
            <LoansPageHeaderContainer loanCarryingBalance={loanCarryingBalance} policy={policy} />
            <hr className="h-0.5 border-none bg-gray-200" />
            {!!loanCarryingBalance && (
                <UpcomingPaymentCard
                    className="content-divider"
                    autopayAmount={upcomingLoanRepayment?.amount}
                    paymentDate={upcomingLoanRepayment?.nextProgramDate}
                    bankDetails={payorBankDetails}
                    additionalCharges={addCharges}
                    paymentFrequencyText={
                        t('paymentFrequencyText', {
                            paymentMode: getFrequency(upcomingLoanRepayment?.frequency as Frequency, defaultT),
                            paymentType: t('paymentType.loan'),
                        }) || undefined
                    }
                    paymentDateText={(!!upcomingLoanRepayment?.nextProgramDate && t('paymentDateText')) || undefined}
                    footerLinks={[
                        {
                            href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/start-loan-payment`,
                            text: t('setUpAutopay'),
                            isDisabled: !loanPaymentEnabled || upcomingLoanRepayment?.nextProgramDate !== undefined,
                        },
                        {
                            href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/manage-loan-payment`,
                            text: t('manageAutopay'),
                            isDisabled:
                                !loanPaymentEnabled ||
                                !systematicProgramsEligibility?.isEligibleManageAutopay ||
                                !upcomingLoanRepayment?.nextProgramDate,
                            tooltip: formatValidationResult(systematicProgramsEligibility?.validationResult),
                        },
                        {
                            href: '#',
                            isDisabled: !loanCancelEnabled || !loanPaymentEnabled || !upcomingLoanRepayment?.nextProgramDate,
                            text: t('cancelAutopay'),
                            onClick: openCancelSideSheet,
                        },
                        {
                            href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/loan-payment`,
                            text: t('oneTimePaymentText'),
                            isDisabled: !loanRepaymentOneTimeEligibility?.isEligibleLoanRepaymentOneTime,
                            tooltip: formatValidationResult(loanRepaymentOneTimeEligibility?.validationResult),
                        },
                    ]}
                    requestSubTypes={['Setup Loan Repayment', 'Update Loan Repayment']}
                />
            )}
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
