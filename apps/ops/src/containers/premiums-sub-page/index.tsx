import { skipToken, useQuery } from '@tanstack/react-query';
import { SideSheet } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';

import { FooterContent } from '@deps/components/card/card-section/card-section';
import SystematicProgramsCard from '@deps/components/card/card-systematic-programs/card-systematic-programs';
import UpcomingPaymentCard from '@deps/components/card/card-upcoming-payment/card-upcoming-payment';
import { getAddCharges } from '@deps/components/card/card-upcoming-payment/card-upcoming-payment.helpers';
import SideSheetCancelAutopay from '@deps/components/side-sheet/side-sheet-transaction/cancel-autopay/side-sheet-cancel-autopay';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { formatValidationResult } from '@deps/helpers/bpm-transaction.helpers';
import { isTermProduct } from '@deps/helpers/is-term-product.helpers';
import {
    getBankDetails,
    getFlatExtra,
    getParty,
} from '@deps/helpers/payments.helpers';
import { getFrequency } from '@deps/helpers/systematic-program.helpers';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkOneTimePremiumEligibilityQuery,
    checkSystematicProgramsEligibilityQuery,
    checkSystematicProgramEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { TransactionPermission } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    ArrangementType,
    FeatureType,
    ProductType,
    Reason,
    Status,
} from '@zinnia/api-types/types/sor';

import PremiumsPageHeaderContainer from '../page-header/premiums-page-header';
import PolicyTestsCard from './cards/policy-tests-card/policy-tests-card';

export const PremiumsSubPage = () => {
    const { policy, policyDetails } = useContext(PolicyData);
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const premiumSetOrCancelAutopayEnabled =
        featureFlags[FEATURE_FLAGS.PREMIUM_SET_OR_CANCEL_AUTOPAY];
    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

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

    const premiumPrograms =
        systematicPrograms?.filter(
            (sp) => sp.arrangementType === ArrangementType.PAYMENT
        ) || [];

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
                ? t('premium.upcoming.transactions.permissionDeniedTooltip', {
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
                ? t('premium.upcoming.transactions.permissionDeniedTooltip', {
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

    const openCancelSideSheet = (e?: React.MouseEvent) => {
        e && e.preventDefault();
        setIsCancelOpen(true);
    };
    const closeCancelSideSheet = () => setIsCancelOpen(false);

    const premiumSetUpAutopayDisable = !!(
        !setUpAutopayProgramsEligibility?.isEligibleSetUpAutopay ||
        !premiumSetOrCancelAutopayEnabled ||
        upcomingPayment?.nextProgramDate ||
        !isUserPermissionedToAutopay
    );

    const startAutopay = {
        text: t('premium.upcoming.startAutopay'),
        href: `/policies/${planCode}/${policyNumber}/policy/premiums/add-premium-autopay`,
        isDisabled: premiumSetUpAutopayDisable,
        tooltip: !isUserPermissionedToAutopay
            ? t('transactions.permissionDeniedTooltip', {
                  carrier: policyDetails.carrierName,
              })
            : undefined,
    };

    const manageAutopay = {
        text: t('premium.upcoming.manageAutopay'),
        href: `/policies/${planCode}/${policyNumber}/policy/premiums/update-premium-autopay`,
        isDisabled:
            !systematicProgramsEligibility?.isEligibleManageAutopay ||
            !upcomingPayment?.nextProgramDate ||
            !isUserPermissionedToAutopay,
        tooltip: getManageAutopayTooltip(),
    };
    const cancelAutopay = {
        href: '',
        isDisabled:
            !premiumSetOrCancelAutopayEnabled ||
            !systematicProgramsEligibility?.isEligibleManageAutopay ||
            !upcomingPayment?.nextProgramDate ||
            !isUserPermissionedToAutopay,
        text: t('premium.upcoming.cancelAutopay'),
        onClick: openCancelSideSheet,
    };
    const footerContent = [
        startAutopay,
        manageAutopay,
        cancelAutopay,
        {
            text: t('premium.upcoming.oneTimePaymentText'),
            href: `/policies/${planCode}/${policyNumber}/policy/premiums/new-premium`,
            isDisabled:
                !oneTimePremiumEligibility?.isEligibleOneTimePremium ||
                !isUserPermissionedToAutopay,
            tooltip: getOneTimeTooltip(),
        },
    ];

    return (
        <>
            <SideSheet
                trigger={null}
                open={isCancelOpen}
                onOpenChange={setIsCancelOpen}
                preventCloseOnOutsideClick={false}
                header={
                    <Typography variant={TypographyVariant.H2}>
                        {systematicProgramTablesEnabled
                            ? t('allFields.cancelPremiumProgram')
                            : t('allFields.cancelPremiumAutopayTitle')}
                    </Typography>
                }
            >
                <SideSheetCancelAutopay
                    arrangementType={ArrangementType.PAYMENT}
                    onCancel={closeCancelSideSheet}
                    policy={policy}
                    systematicProgramReason={Reason.PREMIUM}
                />
            </SideSheet>
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
            {!systematicProgramTablesEnabled && (
                <UpcomingPaymentCard
                    additionalCharges={addCharges}
                    bankDetails={payorBankDetails}
                    footerLinks={footerContent as FooterContent[]}
                    autopayAmount={upcomingPayment?.amount}
                    paymentDate={upcomingPayment?.nextProgramDate}
                    paymentDateText={
                        (!!upcomingPayment?.nextProgramDate &&
                            t('premium.upcoming.paymentDateText')) ||
                        undefined
                    }
                    paymentFrequencyText={
                        t('premium.upcoming.paymentFrequencyText', {
                            paymentMode: upcomingPayment?.frequency
                                ? getFrequency(upcomingPayment?.frequency, t)
                                : '',
                            paymentType: t(
                                'premium.upcoming.paymentType.premium'
                            ),
                        }) || undefined
                    }
                    requestSubTypes={[
                        'Systematic Program Setup',
                        'Systematic Program Update',
                    ]}
                    hasProgram={!!upcomingPayment}
                />
            )}
            {systematicProgramTablesEnabled && (
                <SystematicProgramsCard
                    programs={[
                        {
                            arrangementType: ArrangementType.PAYMENT,
                            activePrograms: premiumPrograms.filter(
                                (program) => program.status === Status.ACTIVE
                            ),
                            terminatedOrSuspendedPrograms:
                                premiumPrograms.filter(
                                    (program) =>
                                        program.status === Status.TERMINATED ||
                                        program.status === Status.SUSPENDED
                                ),
                            manageAction: manageAutopay,
                            cancelAction: cancelAutopay,
                        },
                    ]}
                    setUpAction={startAutopay}
                    requestSubTypes={[
                        'Systematic Program Setup',
                        'Systematic Program Update',
                    ]}
                />
            )}

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
