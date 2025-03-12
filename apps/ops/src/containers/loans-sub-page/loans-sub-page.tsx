import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helper';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { getBankDetails, getFlatExtra, getParty } from '@deps/helpers/payments.helper';
import { getFrequency } from '@deps/helpers/systematic-program.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { Frequency, Policy, Reason } from '@deps/models/policy/sor-policy';
import { checkEligibilityLoanRepaymentOneTime, TransactionResponseStatus } from '@deps/queries/api/bpm';
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

    const [isLoanRepaymentEligible, setIsLoanRepaymentEligible] = useState<boolean | null>(null);
    const [loanRepaymentIneligibilityMessage, setLoanRepaymentIneligibilityMessage] = useState('');
    const loanPaymentEnabled = featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];

    useEffect(() => {
        const checkEligibility = async () => {
            const eligibilityResponse = await checkEligibilityLoanRepaymentOneTime(policy.product?.planCode, policy.policyNumber, policy.loanValues?.totalLoanBalance);
            const eligible = eligibilityResponse.status === TransactionResponseStatus.Success;

            setIsLoanRepaymentEligible(eligible);

            !eligible && setLoanRepaymentIneligibilityMessage(formatValidationResult(eligibilityResponse?.validationResult));
        };
        checkEligibility();
    }, [policy.loanValues?.totalLoanBalance, policy.policyNumber, policy.product?.planCode]);

    const { coverage, currency, parties, systematicPrograms = [], loanValues, allocation } = policy;

    const loanCarryingBalance = !!loanValues?.totalLoanBalance && loanValues?.totalLoanBalance > 0;
    const upcomingPayment = useMemo(() => systematicPrograms.find(({ reason }) => reason === Reason.LOANREPAYMENT), [systematicPrograms]);
    const payorParty = getParty(parties, upcomingPayment);
    const payorBankDetails = getBankDetails(payorParty, upcomingPayment);

    const flatExtra = getFlatExtra(coverage);
    const addCharges = getAddCharges({ flatExtra, t });

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
                    autopayAmount={upcomingPayment?.amount}
                    paymentDate={upcomingPayment?.nextProgramDate}
                    bankDetails={payorBankDetails}
                    additionalCharges={addCharges}
                    paymentFrequencyText={
                        t('paymentFrequencyText', {
                            paymentMode: getFrequency(upcomingPayment?.frequency as Frequency, defaultT),
                            paymentType: t('paymentType.loan'),
                        }) || undefined
                    }
                    paymentDateText={(!!upcomingPayment?.nextProgramDate && t('paymentDateText')) || undefined}
                    footerLinks={[
                        {
                            href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/manage-loan-payment`,
                            text: t('manageAutopay'),
                            isDisabled: !loanPaymentEnabled || !upcomingPayment?.nextProgramDate,
                        },
                        {
                            href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/start-loan-payment`,
                            text: t('setUpAutopay'),
                            isDisabled: !loanPaymentEnabled || upcomingPayment?.nextProgramDate !== undefined,
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
