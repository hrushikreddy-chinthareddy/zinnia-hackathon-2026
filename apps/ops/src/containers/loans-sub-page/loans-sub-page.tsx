import { useTranslation } from 'next-i18next';

import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helper';
import { isStillInactive } from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { getBankDetails, getFlatExtra, getParty } from '@deps/helpers/payments.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { Policy, Reason } from '@deps/models/policy/sor-policy';

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

    const { coverage, currency, parties, systematicPrograms = [], loanValues, allocation } = policy;

    const loanCarryingBalance = !!loanValues?.totalLoanBalance && loanValues?.totalLoanBalance > 0;
    const upcomingPayment = systematicPrograms.find(({ reason }) => reason === Reason.LOANREPAYMENT);

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
                            paymentMode: t('paymentMode.monthly'),
                            paymentType: t('paymentType.loan'),
                        }) || undefined
                    }
                    paymentDateText={(!!upcomingPayment?.nextProgramDate && t('paymentDateText')) || undefined}
                    footerLinks={[
                        upcomingPayment?.nextProgramDate
                            ? {
                                  href: '#',
                                  text: t('manageAutopay'),
                                  tooltip: isStillInactive.loanPageManageAutopay,
                                  tempInactive: !!isStillInactive.loanPageManageAutopay,
                              }
                            : {
                                  href: '#',
                                  text: t('setUpAutopay'),
                                  tooltip: isStillInactive.loanPageSetUpAutopay,
                                  tempInactive: !!isStillInactive.loanPageSetUpAutopay,
                              },
                        {
                            href: '#',
                            text: t('oneTimePaymentText'),
                            tooltip: isStillInactive.loanPageOTP,
                            tempInactive: !!isStillInactive.loanPageOTP,
                        },
                        {
                            href: `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/loans/new-loan`,
                            text: t('startNew'),
                        },
                    ]}
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
