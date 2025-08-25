import { skipToken, useQuery } from '@tanstack/react-query';
import { TransactionPermission } from '@xd/utils/src/auth/auth';
import {
    ArrangementType,
    FeatureType,
    ProductType,
    Reason,
    Status,
} from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import { FooterContent } from '@deps/components/card/card-section/card-section';
import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helpers';
import SideSheetCancelAutopay from '@deps/components/side-sheet/side-sheet-transaction/cancel-autopay/side-sheet-cancel-autopay';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helpers';
import { isTermProduct } from '@deps/helpers/is-term-product.helpers';
import {
    getBankDetails,
    getFlatExtra,
    getParty,
} from '@deps/helpers/payments.helpers';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkOneTimePremiumEligibilityQuery,
    checkSystematicProgramsEligibilityQuery,
    checkSystematicProgramEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import PremiumsPageHeaderContainer from '../page-header/premiums-page-header';
import PolicyTestsCard from './cards/policy-tests-card/policy-tests-card';

export const PremiumsSubPage = () => {
    const { policy, policyDetails } = useContext(PolicyData);
    const { t: tRoot } = useTranslation(TranslationFiles.COMMON);
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'premium.upcoming',
    });
    const sideSheet = useSideSheetContext();
    const { featureFlags } = useOptimizely();
    const premiumSetOrCancelAutopayEnabled =
        featureFlags[FEATURE_FLAGS.PREMIUM_SET_OR_CANCEL_AUTOPAY];

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
    const pendingLapse = policyFeatures?.find(
        (pf) => pf.featureType === FeatureType.LAPSEASSESSMENT
    );
    const upcomingPayment = useMemo(
        () =>
            systematicPrograms?.find(
                (sp) =>
                    sp.reason === Reason.PREMIUM && sp.status === Status.ACTIVE
            ),
        [systematicPrograms]
    );

    const flatExtra = getFlatExtra(coverage);
    const addCharges = getAddCharges({
        flatExtra,
        keyPrefix: 'premium.upcoming',
        t,
    });

    const payorParty = getParty(parties, upcomingPayment);
    const payorBankDetails = getBankDetails(payorParty, upcomingPayment);

    const isTerm = policy?.product?.productType === ('TERM' as ProductType);

    const { data: oneTimePremiumEligibility } = useQuery({
        queryKey: ['checkOneTimePremiumEligibility', planCode, policyNumber],
        queryFn: () =>
            checkOneTimePremiumEligibilityQuery(
                planCode as string,
                policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleOneTimePremium:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: systematicProgramsEligibility } = useQuery({
        queryKey: [
            'checkSystematicProgramsEligibility',
            planCode,
            policyNumber,
            upcomingPayment?.arrangementId,
        ],
        queryFn: upcomingPayment?.arrangementId
            ? () =>
                  checkSystematicProgramsEligibilityQuery(
                      planCode as string,
                      policyNumber as string,
                      upcomingPayment?.arrangementId as string
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
    const { isPermissioned: isUserPermissionedToAutopay } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );

    const getManageAutopayTooltip = () => {
        const permissionRequired =
            systematicProgramsEligibility?.isEligibleManageAutopay &&
            upcomingPayment?.nextProgramDate;

        if (permissionRequired) {
            return !isUserPermissionedToAutopay
                ? t('transactions.permissionDeniedTooltip', {
                      carrier: policyDetails.carrierName,
                  })
                : undefined;
        }

        return formatValidationResult(
            systematicProgramsEligibility?.validationResult
        );
    };

    const getOneTimeTooltip = () => {
        const permissionRequired =
            oneTimePremiumEligibility?.isEligibleOneTimePremium;

        if (permissionRequired) {
            return !isUserPermissionedToAutopay
                ? t('transactions.permissionDeniedTooltip', {
                      carrier: policyDetails.carrierName,
                  })
                : undefined;
        }

        return formatValidationResult(
            oneTimePremiumEligibility?.validationResult
        );
    };

    const { data: setUpAutopayProgramsEligibility } = useQuery({
        queryKey: [
            'checkSetUpAutopayProgramsEligibility',
            planCode,
            policyNumber,
            upcomingPayment?.arrangementId,
        ],
        queryFn: () =>
            checkSystematicProgramEligibilityQuery(
                planCode as string,
                policyNumber as string,
                upcomingPayment?.arrangementId ?? '',

                {
                    systematicProgram: {
                        arrangementType: ArrangementType.PAYMENT,
                    },
                }
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleSetUpAutopay:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

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
            isDisabled:
                !setUpAutopayProgramsEligibility?.isEligibleSetUpAutopay ||
                !premiumSetOrCancelAutopayEnabled ||
                upcomingPayment?.nextProgramDate ||
                !isUserPermissionedToAutopay,
            tooltip: !isUserPermissionedToAutopay
                ? t('transactions.permissionDeniedTooltip', {
                      carrier: policyDetails.carrierName,
                  })
                : undefined,
        },
        {
            text: t('manageAutopay'),
            href: `/policies/${planCode}/${policyNumber}/policy/premiums/update-premium-autopay`,
            isDisabled:
                !systematicProgramsEligibility?.isEligibleManageAutopay ||
                !upcomingPayment?.nextProgramDate ||
                !isUserPermissionedToAutopay,
            tooltip: getManageAutopayTooltip(),
        },
        {
            // TODO: avoid using # here
            href: '#',
            isDisabled:
                !premiumSetOrCancelAutopayEnabled ||
                !systematicProgramsEligibility?.isEligibleManageAutopay ||
                !upcomingPayment?.nextProgramDate ||
                !isUserPermissionedToAutopay,
            text: t('cancelAutopay'),
            onClick: openCancelSideSheet,
        },
        {
            text: t('oneTimePaymentText'),
            href: `/policies/${planCode}/${policyNumber}/policy/premiums/new-premium`,
            isDisabled:
                !oneTimePremiumEligibility?.isEligibleOneTimePremium ||
                !isUserPermissionedToAutopay,
            tooltip: getOneTimeTooltip(),
        },
    ];

    return (
        <>
            <PremiumsPageHeaderContainer
                costBasis={costBasis}
                currency={currency}
                policyValues={accountValues}
                policyStatus={policyStatus}
                pendingLapse={pendingLapse}
                annualizedPremium={policy.accountValues?.annualizedPremium}
                unearnedPremium={policy.accountValues?.unearnedPremium}
                isTerm={isTermProduct(policy?.product?.productType)}
            />

            <hr className="border-t-2 border-t-background" />
            <UpcomingPaymentCard
                additionalCharges={addCharges}
                bankDetails={payorBankDetails}
                footerLinks={footerContent as FooterContent[]}
                autopayAmount={upcomingPayment?.amount}
                paymentDate={upcomingPayment?.nextProgramDate}
                paymentDateText={
                    (!!upcomingPayment?.nextProgramDate &&
                        t('paymentDateText')) ||
                    undefined
                }
                paymentFrequencyText={
                    t('paymentFrequencyText', {
                        paymentMode: tRoot(
                            `systematicProgram.frequency.${upcomingPayment?.frequency?.toLowerCase()}`
                        ),
                        paymentType: t('paymentType.premium'),
                    }) || undefined
                }
                requestSubTypes={[
                    'Systematic Program Setup',
                    'Systematic Program Update',
                ]}
                hasProgram={!!upcomingPayment}
            />

            {!isTerm && !isAnnuity && (
                <>
                    <hr className="border-t-2 border-t-background" />
                    <PolicyTestsCard policy={policy} />
                </>
            )}
        </>
    );
};

export default PremiumsSubPage;
