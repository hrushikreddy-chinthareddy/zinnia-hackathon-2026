import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useMemo, useState } from 'react';

import { FooterContent } from '@deps/components/card/card-section/card-section';
import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helper';
import SideSheetCancelAutopay from '@deps/components/side-sheet/side-sheet-transaction/cancel-autopay/side-sheet-cancel-autopay';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helper';
import { getBankDetails, getFlatExtra, getParty } from '@deps/helpers/payments.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { ArrangementType, PolicyFeatureFeatureType, ProductType, Reason } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, checkEligibilityOneTimePremium, checkEligibilitySystematicPrograms } from '@deps/queries/api/bpm';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import PremiumsPageHeaderContainer from '../page-header/premiums-page-header';
import PolicyTestsCard from './cards/policy-tests-card/policy-tests-card';

export const PremiumsSubPage = () => {
    const { breadcrumb } = useBreadcrumb();
    const { policy, policyDetails } = useContext(PolicyData);
    const { t: tRoot } = useTranslation(TranslationFiles.COMMON);
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'premium.upcoming' });
    const sideSheet = useSideSheetContext();
    const { featureFlags } = useOptimizely();
    const premiumSetOrCancelAutopayEnabled = featureFlags[FEATURE_FLAGS.PREMIUM_SET_OR_CANCEL_AUTOPAY];

    const [isEligibleManageAutopay, setIsEligibleManageAutopay] = useState(false);
    const [ineligibleManageAutopayReason, setIneligibleManageAutopayReason] = useState('');

    const [isEligibleNewPremium, setIsEligibleNewPremium] = useState(false);
    const [ineligibleNewPremiumReason, setIneligibleNewPremiumReason] = useState('');

    const {
        accountValues,
        costBasis,
        coverage,
        currency,
        parties,
        policyFeatures,
        policyNumber,
        policyStatus,
        product,
        systematicPrograms,
    } = policy;
    const { planCode } = product ?? {};

    const { isAnnuity } = policyDetails;
    const pendingLapse = policyFeatures?.find(pf => pf.featureType === ('LAPSEASSESSMENT' as PolicyFeatureFeatureType));
    const upcomingPayment = useMemo(() => systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM), [systematicPrograms]);

    const flatExtra = getFlatExtra(coverage);
    const addCharges = getAddCharges({ flatExtra, t });

    const payorParty = getParty(parties, upcomingPayment);
    const payorBankDetails = getBankDetails(payorParty, upcomingPayment);

    const isTerm = policy?.product?.productType === ('TERMLIFE' as ProductType);

    useEffect(() => {
        const checkManageAutopayEligibility = async () => {
            const arrangementId = upcomingPayment?.arrangementId || '';

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

        const checkOneTimeEligibility = async () => {
            const oneTimeEligibility = await checkEligibilityOneTimePremium(planCode, policyNumber);

            if (oneTimeEligibility?.status === TransactionResponseStatus.Success) {
                setIsEligibleNewPremium(true);
            } else {
                setIneligibleNewPremiumReason(formatValidationResult(oneTimeEligibility?.validationResult));
            }
        };

        checkManageAutopayEligibility();
        checkOneTimeEligibility();
    }, [planCode, policyNumber, upcomingPayment]);

    const openCancelSideSheet = () => {
        sideSheet.changeSideSheetContent(
            <Typography variant={TypographyVariant.H2}>
                {t('cancelPremiumAutopayTitle')}
            </Typography>,
            <SideSheetCancelAutopay
                arrangementType={ArrangementType.PAYMENT}
                onCancel={() => sideSheet.handleOpen(false)}
                policy={policy}
                systematicProgramReason={Reason.PREMIUM}
            />
            
        );
        sideSheet.handleOpen(true);
    };

    const footerContent = [
        {
            text: t('startAutopay'),
            href: `/policies/${planCode}/${policyNumber}/policy/premiums/add-premium-autopay`,
            isDisabled: !premiumSetOrCancelAutopayEnabled || upcomingPayment?.nextProgramDate,
        },
        {
            text: t('manageAutopay'),
            href: `/policies/${planCode}/${policyNumber}/policy/premiums/update-premium-autopay`,
            isDisabled: !isEligibleManageAutopay || !upcomingPayment?.nextProgramDate,
            tooltip: ineligibleManageAutopayReason,
        },
        {
            href: '#',
            isDisabled: !isEligibleManageAutopay || !premiumSetOrCancelAutopayEnabled || !upcomingPayment?.nextProgramDate,
            text: t('cancelAutopay'),
            onClick: openCancelSideSheet
        },
        {
            text: t('oneTimePaymentText'),
            href: `/policies/${planCode}/${policyNumber}/policy/premiums/new-premium`,
            isDisabled: !isEligibleNewPremium,
            tooltip: ineligibleNewPremiumReason,
        },
    ];

    return (
        <div className="rounded bg-gray-50 shadow-elevation-light-04">
            <div className="flex items-center rounded-t bg-white">
                <PremiumsPageHeaderContainer
                    breadcrumbText={breadcrumb?.text}
                    breadcrumbUrl={breadcrumb?.url}
                    costBasis={costBasis}
                    currency={currency}
                    policyValues={accountValues}
                    policyStatus={policyStatus}
                    pendingLapse={pendingLapse}
                />
            </div>

            <hr className="border-t-2 border-t-background" />
            <UpcomingPaymentCard
                additionalCharges={addCharges}
                bankDetails={payorBankDetails}
                footerLinks={footerContent as FooterContent[]}
                autopayAmount={upcomingPayment?.amount}
                paymentDate={upcomingPayment?.nextProgramDate}
                paymentDateText={(!!upcomingPayment?.nextProgramDate && t('paymentDateText')) || undefined}
                paymentFrequencyText={
                    t('paymentFrequencyText', {
                        paymentMode: tRoot(`systematicProgram.frequency.${upcomingPayment?.frequency?.toLowerCase()}`),
                        paymentType: t('paymentType.premium'),
                    }) || undefined
                }
                requestSubTypes={["Systematic Program Setup", "Systematic Program Update"]}
            />

            {!isTerm && !isAnnuity && (
                <>
                    <hr className="border-t-2 border-t-background" />
                    <PolicyTestsCard policy={policy} />
                </>
            )}
        </div>
    );
};

export default PremiumsSubPage;
