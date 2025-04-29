import { PopoverPlacement } from '@zinnia/bloom/components';
import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import clsx from 'clsx';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageHeader from '@deps/components/page-header/page-header';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Policy, PolicyFeatureFeatureType, PolicyStatus } from '@deps/models/policy/sor-policy';

interface AnnuitizationPageHeaderProps {
    policy: Policy;
    policyDetails: PolicyDetails;
}

export const AnnuitizationPageHeader: FC<AnnuitizationPageHeaderProps> = ({ policy, policyDetails }) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'annuitization',
    });

    const { features, policyStatus } = policyDetails;
    const { deathBenefit } = policy;
    const isPayoutStage = policyStatus === PolicyStatus.PAYOUT;
    const annuitizationFeature = features.getFirstFeatureByType('ANNUITIZATION' as PolicyFeatureFeatureType);
    const headerRowFlexClassNames = clsx('flex-col', 'xs:gap-4 lg:gap-0');
    const groupOneFlexClassNames = 'flex gap-4';
    const generateBadgeText = useCallback(
        (policyStatus: PolicyStatus | undefined) => {
            switch (policyStatus) {
                case PolicyStatus.ACTIVE:
                    return t('headerDetails.accumulationPhase');
                case PolicyStatus.PAYOUT:
                    return t('headerDetails.incomePhase');
                default:
                    return '';
            }
        },
        [t]
    );

    const generateBadgeTooltip = useCallback(
        (policyStatus: PolicyStatus | undefined) => {
            switch (policyStatus) {
                case PolicyStatus.ACTIVE:
                    return t('headerDetails.accumulationPhase');
                case PolicyStatus.PAYOUT:
                    return t('headerDetails.incomePhase');
                default:
                    return '';
            }
        },
        [t]
    );

    const belowHeaderTextChildren = (
        <div className="mt-4 w-fit">
            <div className="flex flex-col gap-8 xl:flex-row">
                <div className="flex flex-col gap-8 md:flex-row">
                    <div className="w-[224px] xl:w-fit">
                        <Label
                            label={t('headerDetails.payoutOption')}
                            tooltipTitle={t('headerDetails.payoutOption')}
                            tooltipBody={t('headerDetails.payoutOptionTooltip')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content details={deathBenefit?.deathBenefitOption || DEFAULT_ERROR_STRING} variant={ContentVariant.Value} />
                    </div>
                </div>
                <div className="flex flex-col gap-8 md:flex-row">
                    <div className="w-[224px] xl:w-fit">
                        <Label
                            label={t('headerDetails.fixedPayoutAmount')}
                            tooltipTitle={t('headerDetails.fixedPayoutAmount')}
                            tooltipBody={t('headerDetails.fixedPayoutAmount')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content details={numberFormatify(annuitizationFeature?.paymentAmount as number) || DEFAULT_ERROR_STRING} />
                        <Content
                            className="text-gray-600"
                            details={`${t('headerDetails.fixedExclusionAmount')}: ${numberFormatify(
                                annuitizationFeature?.exclusionAmount as number
                            )}`}
                            variant={ContentVariant.Caption}
                        />
                    </div>
                    <div className="w-[224px] xl:w-fit">
                        <Label
                            label={t('headerDetails.totalAnnuityPayments')}
                            tooltipTitle={t('headerDetails.totalAnnuityPayments')}
                            tooltipBody={t('headerDetails.totalAnnuityPayments')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content details={numberFormatify(annuitizationFeature?.totalPaymentAmount as number) || DEFAULT_ERROR_STRING} />
                        <Content
                            className="text-gray-600"
                            details={`${t('headerDetails.ytdAnnuityPayments')}: ${numberFormatify(
                                annuitizationFeature?.yearToDatePaymentAmount as number
                            )}`}
                            variant={ContentVariant.Caption}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        <PageHeader
            headerText={t('title') as string}
            belowHeaderTextChildren={belowHeaderTextChildren}
            headerRowFlexClassNames={headerRowFlexClassNames}
            groupOneFlexClassNames={groupOneFlexClassNames}
            headerTextSiblingsGroupOne={
                <BadgeWithTooltip
                    className="mb-2 mt-2 self-center"
                    label={generateBadgeText(policyStatus)}
                    tooltip={generateBadgeTooltip(policyStatus)}
                    tooltipPlacement={PopoverPlacement.BottomRight}
                    variant={isPayoutStage ? BadgeVariant.Positive : BadgeVariant.Negative}
                />
            }
        />
    );
};
