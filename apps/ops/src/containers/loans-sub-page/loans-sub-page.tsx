import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helper';
import SideSheetCancelAutopay from '@deps/components/side-sheet/side-sheet-transaction/cancel-autopay/side-sheet-cancel-autopay';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { getBankDetails, getFlatExtra, getParty } from '@deps/helpers/payments.helper';
import { getFrequency } from '@deps/helpers/systematic-program.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { ArrangementType, Frequency, Policy, Reason } from '@deps/models/policy/sor-policy';
import { checkEligibilityLoanRepaymentOneTime, checkEligibilitySystematicPrograms, TransactionResponseStatus } from '@deps/queries/api/bpm';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import LoanRulesCard from './cards/loan-rules-card';
import OutstandingLoansCard from './cards/outstanding-loans-card';
import LoansPageHeaderContainer from '../page-header/loans-page-header';

interface LoansContainerProps {
    policy: Policy;
}

export const LoansSubPage = ({ policy }: LoansContainerProps) => {
    const { breadcrumb } = useBreadcrumb();
    const { t } = useTranslation(undefined, {
        keyPrefix: 'premium.upcoming',
    });
    const { t: defaultT } = useTranslation();
    const { featureFlags } = useOptimizely();
    
    const [isEligibleManageAutopay, setIsEligibleManageAutopay] = useState(false);
    const [ineligibleManageAutopayReason, setIneligibleManageAutopayReason] = useState('');
    const sideSheet = useSideSheetContext();

    const [isLoanRepaymentEligible, setIsLoanRepaymentEligible] = useState<boolean | null>(null);
    const [loanRepaymentIneligibilityMessage, setLoanRepaymentIneligibilityMessage] = useState('');
    const loanPaymentEnabled = featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];

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

    const loanCarryingBalance = !!loanValues?.totalLoanBalance && loanValues?.totalLoanBalance > 0;
    const upcomingLoanRepayment = useMemo(() => systematicPrograms?.find(({ reason }) => reason === Reason.LOANREPAYMENT), [systematicPrograms]);

    const payorParty = getParty(parties, upcomingLoanRepayment);
    const payorBankDetails = getBankDetails(payorParty, upcomingLoanRepayment);

    const flatExtra = getFlatExtra(coverage);
    const addCharges = getAddCharges({ flatExtra, t });

    useEffect(() => {

        const checkManageAutopayEligibility = async () => {
            const arrangementId = upcomingLoanRepayment?.arrangementId || '';

            if (!arrangementId) {
                setIsEligibleManageAutopay(true);

                return;
            }

            const manageAutopayEligibility = await checkEligibilitySystematicPrograms(planCode, policyNumber, arrangementId);

            if (manageAutopayEligibility?.status === TransactionResponseStatus.Success) {
                setIsEligibleManageAutopay(true);
            } else {
                setIneligibleManageAutopayReason(formatValidationResult(manageAutopayEligibility?.validationResult));
            }
        };

        const checkOneTimeRepaymentEligibility = async () => {
            const eligibilityResponse = await checkEligibilityLoanRepaymentOneTime(planCode, policyNumber, policy.loanValues?.totalLoanBalance);
            const eligible = eligibilityResponse.status === TransactionResponseStatus.Success;

            setIsLoanRepaymentEligible(eligible);

            !eligible && setLoanRepaymentIneligibilityMessage(formatValidationResult(eligibilityResponse?.validationResult));
        };
        checkManageAutopayEligibility();
        checkOneTimeRepaymentEligibility();
    }, [planCode, policy.loanValues?.totalLoanBalance, policyNumber, upcomingLoanRepayment?.arrangementId]);

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

    return (
        <div className="rounded shadow-elevation-light-04">
            <LoansPageHeaderContainer
                loanCarryingBalance={loanCarryingBalance}
                policy={policy}
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
            />
            <hr className="h-0.5 border-none bg-gray-100" />
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
                            isDisabled: !loanPaymentEnabled || !isEligibleManageAutopay || !upcomingLoanRepayment?.nextProgramDate,
                            tooltip: !isEligibleManageAutopay ? ineligibleManageAutopayReason : undefined,
                        },
                        {
                            href: '#',
                            isDisabled: !loanPaymentEnabled || !upcomingLoanRepayment?.nextProgramDate,
                            text: t('cancelAutopay'),
                            onClick: openCancelSideSheet
                        },
                        {
                            href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/loan-payment`,
                            text: t('oneTimePaymentText'),
                            isDisabled: !isLoanRepaymentEligible,
                            tooltip: !isLoanRepaymentEligible ? loanRepaymentIneligibilityMessage : undefined,
                        },
                    ]}
                    requestSubTypes={["Setup Loan Repayment", "Update Loan Repayment"]}
                />
            )}
            <LoanRulesCard currency={currency} loanValues={loanValues} />
            <OutstandingLoansCard
                currency={currency}
                lastLoanInterestDueDate={loanValues?.lastLoanInterestDueDate}
                loanSegments={allocation?.loanSegments}
            />
        </div>
    );
};

export default LoansSubPage;
