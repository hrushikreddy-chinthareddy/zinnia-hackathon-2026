import { Policy as SorPolicy } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helper';
import { isStillInactive } from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import WithdrawalsPageHeaderContainer from '@deps/containers/page-header/withdrawals-page-header';
import WithdrawalRules from '@deps/containers/withdrawal-rules/withdrawal-rules';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { getBankDetails, getFlatExtra, getParty } from '@deps/helpers/payments.helper';
import { TempAnnuityArrangementTypes } from '@deps/helpers/policy-sor/SystematicPrograms';
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

    const withdrawalsValues = mapWithdrawalsSubPage({
        isEligible: withdrawalEligibilityValues.isEligible,
        policy: policyDetails.policy as SorPolicy,
    });

    const rmdPrograms = policyDetails.systematicPrograms.getProgramsByType(ArrangementType.REQUIREDMINIMUMDISTRIBUTION);
    const withdrawalprograms = policyDetails.systematicPrograms.getProgramsByType(ArrangementType.WITHDRAWAL);
    //TODO: remove these lines below when lifeCAD fixes the arrangementType values they are sending back to us.
    const [rmdProgram] = rmdPrograms.length
        ? rmdPrograms
        : policyDetails.systematicPrograms.getProgramsByType(TempAnnuityArrangementTypes.REQUIREDMINIMUMDISTRIBUTION);
    const [withdrawalProgram] = withdrawalprograms.length
        ? withdrawalprograms
        : policyDetails.systematicPrograms.getProgramsByType(TempAnnuityArrangementTypes.WITHDRAWAL);

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
            <WithdrawalRules policy={policy} policyDetails={policyDetails} />

            {policyDetails.isAnnuity && (
                <>
                    <hr className="h-0.5 border-none bg-gray-100" />
                    <UpcomingPaymentCard
                        title={`${t('withdrawalAutopay')}`}
                        titleCase={false}
                        autopayAmount={withdrawalProgram?.amount}
                        paymentDate={withdrawalProgram?.nextProgramDate}
                        bankDetails={getBankDetails(getParty(policyDetails.allParties, withdrawalProgram), withdrawalProgram)}
                        additionalCharges={getAddCharges({ flatExtra: getFlatExtra(policy.coverage), t })}
                        footerLinks={[
                            withdrawalProgram?.nextProgramDate
                                ? {
                                      href: '#',
                                      text: t('manageAutopay'),
                                      tooltip: isStillInactive.withdrawalManageAutopay,
                                      tempInactive: !!isStillInactive.withdrawalManageAutopay,
                                  }
                                : {
                                      href: '#',
                                      text: t('setUpAutopay'),
                                      tooltip: isStillInactive.withdrawalSetupAutopay,
                                      tempInactive: !!isStillInactive.withdrawalSetupAutopay,
                                  },
                        ]}
                    />
                    <UpcomingPaymentCard
                        autopayAmount={rmdProgram?.amount}
                        title={`${t('rmdAutopay')}`}
                        paymentDate={rmdProgram?.nextProgramDate}
                        bankDetails={getBankDetails(getParty(policyDetails.allParties, rmdProgram), rmdProgram)}
                        additionalCharges={getAddCharges({ flatExtra: getFlatExtra(policy.coverage), t })}
                        footerLinks={[
                            withdrawalProgram?.nextProgramDate
                                ? {
                                      href: '#',
                                      text: t('manageAutopay'),
                                      tooltip: isStillInactive.withdrawalManageAutopay,
                                      tempInactive: !!isStillInactive.withdrawalManageAutopay,
                                  }
                                : {
                                      href: '#',
                                      text: t('setUpAutopay'),
                                      tooltip: isStillInactive.withdrawalSetupAutopay,
                                      tempInactive: !!isStillInactive.withdrawalSetupAutopay,
                                  },
                        ]}
                    />
                </>
            )}
        </div>
    );
};

export default WithdrawalsSubPage;
