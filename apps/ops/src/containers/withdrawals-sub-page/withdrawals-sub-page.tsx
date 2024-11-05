import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helper';
import WithdrawalsPageHeaderContainer from '@deps/containers/page-header/withdrawals-page-header';
import WithdrawalRules from '@deps/containers/withdrawal-rules/withdrawal-rules';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { getBankDetails, getFlatExtra, getParty } from '@deps/helpers/payments.helper';
import { mapWithdrawalsSubPage } from '@deps/helpers/withdrawals.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { ArrangementType, Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, checkEligibilityPartialWithdrawalOneTime } from '@deps/queries/api/bpm';

interface WithdrawalsSubPageProps {
    policy: Policy;
}

export interface WithdrawalEligibilityValues {
    ineligibleReason: string;
    isEligible: boolean;
    isLoading: boolean;
}

const WithdrawalsSubPage = ({ policy }: WithdrawalsSubPageProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'withdrawals.upcoming' });
    const { breadcrumb } = useBreadcrumb();
    const { policyDetails } = useContext(PolicyData);

    const [withdrawalEligibilityValues, setWithdrawalEligibilityValues] = useState({
        ineligibleReason: '',
        isEligible: false,
        isLoading: true,
    });

    useEffect(() => {
        const checkWithdrawalEligibility = async () => {
            const manageAutopayEligibility = await checkEligibilityPartialWithdrawalOneTime(
                policyDetails.planCode,
                policyDetails.policyNumber
            );

            if (manageAutopayEligibility?.status === TransactionResponseStatus.Success) {
                setWithdrawalEligibilityValues(prevState => ({ ...prevState, isEligible: true, isLoading: false }));
            } else {
                setWithdrawalEligibilityValues(prevState => ({
                    ...prevState,
                    ineligibleReason: formatValidationResult(manageAutopayEligibility?.validationResult),
                    isLoading: false,
                }));
            }
        };

        checkWithdrawalEligibility();
    }, [policyDetails.planCode, policyDetails.policyNumber]);

    const withdrawalsValues = mapWithdrawalsSubPage({ isEligible: withdrawalEligibilityValues.isEligible, policy: policyDetails.policy });

    const [rmdProgram] = policyDetails.systematicPrograms.getProgramsByType(ArrangementType.REQUIREDMINIMUMDISTRIBUTION);
    const [withdrwalProgram] = policyDetails.systematicPrograms.getProgramsByType(ArrangementType.WITHDRAWAL);

    return (
        <div className="rounded bg-gray-50 shadow-elevation-light-04">
            <WithdrawalsPageHeaderContainer
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
                withdrawalEligibilityValues={withdrawalEligibilityValues}
                planCode={policyDetails.planCode}
                policyNumber={policyDetails.policyNumber}
                withdrawalsValues={withdrawalsValues}
            />
            <hr className="h-0.5 border-none bg-gray-100" />
            {policyDetails.isAnnuity && (
                <UpcomingPaymentCard
                    monthlyAmount={rmdProgram?.amount}
                    title={`${t('withdrawalAutopay')}`}
                    paymentDate={rmdProgram?.nextProgramDate}
                    bankDetails={getBankDetails(getParty(policyDetails.allParties, rmdProgram), rmdProgram)}
                    additionalCharges={getAddCharges({ flatExtra: getFlatExtra(policy.coverage), t })}
                    footerLinks={[
                        {
                            href: '#',
                            text: t('manageAutopay'),
                        },
                        {
                            href: '#',
                            text: t('oneTimePaymentText'),
                        },
                    ]}
                />
            )}
            <WithdrawalRules policy={policy} policyDetails={policyDetails} />
            {policyDetails.isAnnuity && (
                <UpcomingPaymentCard
                    title={`${t('rmdAutopay')}`}
                    titleCase={false}
                    monthlyAmount={withdrwalProgram?.amount}
                    paymentDate={withdrwalProgram?.nextProgramDate}
                    bankDetails={getBankDetails(getParty(policyDetails.allParties, withdrwalProgram), withdrwalProgram)}
                    additionalCharges={getAddCharges({ flatExtra: getFlatExtra(policy.coverage), t })}
                    footerLinks={[
                        {
                            href: '#',
                            text: t('manageAutopay'),
                        },
                        {
                            href: '#',
                            text: t('oneTimePaymentText'),
                        },
                    ]}
                />
            )}
        </div>
    );
};

export default WithdrawalsSubPage;
