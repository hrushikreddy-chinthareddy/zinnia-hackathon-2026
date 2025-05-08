import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helpers';
import { isStillInactive } from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import WithdrawalsPageHeaderContainer from '@deps/containers/page-header/withdrawals-page-header';
import WithdrawalRules from '@deps/containers/withdrawal-rules/withdrawal-rules';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { getBankDetails, getFlatExtra, getParty } from '@deps/helpers/payments.helpers';
import { TempAnnuityArrangementTypes } from '@deps/helpers/policy-sor/SystematicPrograms';
import { ArrangementType, Policy } from '@deps/models/policy/sor-policy';

interface WithdrawalsSubPageProps {
    policy: Policy;
}

const WithdrawalsSubPage = ({ policy }: WithdrawalsSubPageProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'withdrawals.upcoming' });
    const { policyDetails } = useContext(PolicyData);

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
        <>
            <WithdrawalsPageHeaderContainer planCode={policyDetails.planCode} policyNumber={policyDetails.policyNumber} />
            <hr className="h-0.5 border-none bg-gray-200" />
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
        </>
    );
};

export default WithdrawalsSubPage;
