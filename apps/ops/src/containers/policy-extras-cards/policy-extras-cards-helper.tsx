import { Skeleton } from '@radix-ui/themes';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';
import React, { ReactElement } from 'react';

import BadgeWithTooltip, { BadgeWithTooltipProps } from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PolicyExtrasCardProps } from '@deps/components/policy-extras-card/policy-extras-card';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString, isNullEmptyOrUndefined, toSentenceCase } from '@deps/helpers/string.helper';
import { FeaturesCardsTest, RidersCardsTest } from '@deps/jest/constants/test-id-constants';
import { PolicyFeature, PolicyFeatureFeatureType, Rider } from '@deps/models/policy/sor-policy';
import { DEFAULT_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ConfiguredSettingId } from '@deps/types/product-config-settings';
import { BenefitId, CoverageId, CoverageToBenefitId, RiderBenefit } from '@deps/types/product-rate';

import { ExtrasCardType } from './policy-extras-cards';
import { ExtraFilters, filterValidFeature } from '../policy-extras-sub-page/policy-extras-sub-page.helper';

export const RIDER_NOT_ELECTED = 'NOT ELECTED';

export const riderChronicIllnessSettings = [
    ConfiguredSettingId.MaxAmount,
    ConfiguredSettingId.MaxNumberOfYearsToPay,
    ConfiguredSettingId.MaxBenefitPercentage,
];

export const riderCriticalIllnessSettings = [
    ConfiguredSettingId.MaxAmount,
    ConfiguredSettingId.MaxBenefitPercentage,
    ConfiguredSettingId.MaxAmountT2,
    ConfiguredSettingId.MaxBenefitPercentageT2,
];

export const riderTerminalIllnessSettings = [ConfiguredSettingId.MaxAmount, ConfiguredSettingId.MaxBenefitPercentage];

// Overloan protection riders do not require any data from the API to show for now
export const riderOverloanProtectionSettings = [];

type PolicyExtrasCards = {
    cardKey: string;
    cardProps: PolicyExtrasCardProps;
    status: string;
    type: ExtrasCardType;
};

interface CardFields {
    key: string;
    testId: string;
    label: string;
    details?: string;
    customContent?: React.ReactNode;
}

const getBadgeFromFeature = (feature: PolicyFeature, t: TFunction): { badge: ReactElement<BadgeWithTooltipProps>; status: string } => {
    if (dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isBefore(dayjs())) {
        return {
            badge: (
                <BadgeWithTooltip
                    rounded
                    label={toSentenceCase(t('features.terminated') as string)}
                    tooltip={t('features.terminatedTooltip') as string}
                    variant={BadgeVariant.Info}
                />
            ),
            status: ExtraFilters.Terminated,
        };
    }
    if (feature.approvalDate) {
        return {
            badge: (
                <BadgeWithTooltip
                    rounded
                    label={toSentenceCase(t('features.active') as string)}
                    tooltip={t('features.activeTooltip') as string}
                    variant={BadgeVariant.Success}
                />
            ),
            status: ExtraFilters.Active,
        };
    }
    return {
        badge: (
            <BadgeWithTooltip
                rounded
                label={toSentenceCase(t('features.available') as string)}
                tooltip={t('features.availableTooltip') as string}
                variant={BadgeVariant.Success}
            />
        ),
        status: ExtraFilters.Available,
    };
};

const getRiderStatus = (rider: Rider): string => {
    if (rider.riderElected === RIDER_NOT_ELECTED) return ExtraFilters.NotElected;

    switch (rider.status?.toLowerCase()) {
        case ExtraFilters.Active:
            return ExtraFilters.Available;
        case ExtraFilters.Pending:
            return ExtraFilters.Active;
        case ExtraFilters.Terminated:
            return ExtraFilters.Terminated;
        default:
            console.error('getRiderStatus::Invalid or unsupported rider type', rider.status);
            return rider.status ?? '';
    }
};

const getBadgeFromRider = (rider: Rider, t: TFunction): ReactElement<BadgeWithTooltipProps> => {
    if (rider.riderElected === RIDER_NOT_ELECTED) {
        return (
            <BadgeWithTooltip
                rounded
                label={toSentenceCase(t('riders.notElected') as string)}
                tooltip={t('riders.notElectedTooltip') as string}
                variant={BadgeVariant.Default}
            />
        );
    }

    switch (rider.status?.toLowerCase()) {
        case ExtraFilters.Active:
            return (
                <BadgeWithTooltip
                    rounded
                    label={toSentenceCase(t('riders.available') as string)}
                    tooltip={t('riders.availableTooltip') as string}
                    variant={BadgeVariant.Success}
                />
            );
        case ExtraFilters.Pending:
            return (
                <BadgeWithTooltip
                    rounded
                    label={toSentenceCase(t('riders.active') as string)}
                    tooltip={t('riders.activeTooltip') as string}
                    variant={BadgeVariant.Success}
                />
            );
        case ExtraFilters.Terminated:
            return (
                <BadgeWithTooltip
                    rounded
                    label={toSentenceCase(t('riders.terminated') as string)}
                    tooltip={t('riders.terminatedTooltip') as string}
                    variant={BadgeVariant.Info}
                />
            );
        default:
            console.error('getBadgeFromRider::Invalid or unsupported rider type', rider.status);
            return null as unknown as ReactElement<BadgeWithTooltipProps>; // BPB - fix the right way
    }
};

const getRiderInsuredContent = (
    policyDetails: PolicyDetails,
    { riderName, riderParticipant }: Rider
): React.ReactNode => {
    const insuredIds = riderParticipant?.map(participants => participants.insuredId);

    if (!insuredIds?.length) {
        return <Content details={DEFAULT_ERROR_STRING} variant={ContentVariant.Body} />;
    }

    const insuredElements = insuredIds.map((insuredId, index) => {
        const insuredParty = policyDetails.getPartyById(insuredId);

        if (!policyDetails.coveredPeople.length || !insuredParty?.partyId) {
            return (
                <Content
                    details={insuredParty?.fullName}
                    key={`insured-${insuredId}-${index}`}
                    variant={ContentVariant.Body}
                    pii={true}
                />
            );
        }

        return (
            <NavElement
                key={`insured-${insuredId}`}
                href={`/policies/${policyDetails.planCode}/${policyDetails.policyNumber}/people/${insuredParty.partyId}`}
                size={NavElementSize.Small}
                type={NavElementType.Link}
            >
                <PiiWrapper>{insuredParty?.fullName}</PiiWrapper>
            </NavElement>
        );
    });

    return (
        <div className="flex flex-col" data-testid={`${RidersCardsTest.Insured}-${riderName}-values`}>
            {insuredElements}
        </div>
    );
};

const getRiderSubheader = (rider: Rider, riderBenefitData: RiderBenefit, t: TFunction, currency: string): (string | null)[] => {
    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };
    const integerFormat = { maximumFractionDigits: 0 };

    switch (riderBenefitData?.benefitId) {
        case BenefitId.ChronicIllness:
            return [
                riderBenefitData
                    ? toSentenceCase(
                          t('riders.chronicIllnessBenefit', {
                              percent: numberFormatify(riderBenefitData[ConfiguredSettingId.MaxBenefitPercentage], integerFormat),
                              period: numberFormatify(riderBenefitData[ConfiguredSettingId.MaxNumberOfYearsToPay], integerFormat),
                          }) as string
                      )
                    : null,
            ];

        case BenefitId.CriticalIllness:
            return [
                riderBenefitData
                    ? (t('riders.criticalIllnessBenefit1', {
                          t1Percent: numberFormatify(riderBenefitData[ConfiguredSettingId.MaxBenefitPercentage], integerFormat),
                          t1Amount: numberFormatify(riderBenefitData[ConfiguredSettingId.MaxAmount], currencyFormat),
                      }) as string)
                    : null,
                riderBenefitData
                    ? (t('riders.criticalIllnessBenefit2', {
                          t2Percent: numberFormatify(riderBenefitData[ConfiguredSettingId.MaxBenefitPercentageT2], integerFormat),
                          t2Amount: numberFormatify(riderBenefitData[ConfiguredSettingId.MaxAmountT2], currencyFormat),
                      }) as string)
                    : null,
            ];

        case BenefitId.TerminalIllness:
            return [
                riderBenefitData
                    ? toSentenceCase(
                          t('riders.terminalIllnessBenefit', {
                              percent: numberFormatify(riderBenefitData[ConfiguredSettingId.MaxBenefitPercentage], integerFormat),
                              amount: numberFormatify(riderBenefitData[ConfiguredSettingId.MaxAmount], currencyFormat),
                          }) as string
                      )
                    : null,
            ];
        case BenefitId.OverloanProtection:
        default:
            return [];
    }
};

const getFeatureHeader = (feature: PolicyFeature, t: TFunction): string => {
    switch (feature.featureType) {
        case 'LAPSEPROTECTION' as PolicyFeatureFeatureType:
            return t('features.lapseProtection') as string;
        default:
            return feature.featureType ?? '';
    }
};

const getFeatureSubheader = (feature: PolicyFeature, t: TFunction): (string | null)[] => {
    switch (feature.featureType) {
        case 'LAPSEPROTECTION' as PolicyFeatureFeatureType:
            return [
                toSentenceCase(
                    t(feature.period === 1 ? 'features.oneYearProtectionGuarantee' : 'features.nYearsProtectionGuarantee', {
                        n: feature.period,
                    }) as string
                ),
            ];
        default:
            return [];
    }
};

const createFieldKvp = ({ key, testId, label, details, customContent }: CardFields) => {
    return (
        <span data-testid={testId} key={key}>
            <Label variant={LabelVariant.FieldLabel} label={label} />
            <Skeleton
                loading={isNullEmptyOrUndefined(details) && isNullEmptyOrUndefined(customContent)}
                minWidth="60px"
                maxWidth="100px"
                height="20px"
            >
                {customContent || <Content details={details} variant={ContentVariant.BodySm} />}
            </Skeleton>
        </span>
    );
};


const mapFeatureFields = (feature: PolicyFeature, t: TFunction, currency: string, isAnnuity = false): ReactElement[] => {

    const formatPolicyFeatureDate = (date: string | Date | undefined) => {
        if (date === '2999-12-31') return t('features.lifetime');
        return dayjs(date, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT);
    }

    const additionalFields = isAnnuity ? [
        {
            // @ts-expect-error until spec is updated
            key: `feature-extras-card-${feature.featureDescription}-field-description`,
            testId: `${FeaturesCardsTest.Description}-${feature.timestamp}`,
            label: t('features.featureDescription'),
            // @ts-expect-error until spec is updated
            details: feature.featureDescription,
        }
    ] : [
        {
            key: `feature-extras-card-${feature.timestamp}-field-cost`,
            testId: `${FeaturesCardsTest.Cost}-${feature.timestamp}`,
            label: t('features.cost'),
            details: numberFormatify(feature.paymentAmount as number, { style: 'currency', currency }),
        },
        {
            key: `feature-extras-card-${feature.timestamp}-field-pmt`,
            testId: `${FeaturesCardsTest.CumulativePayment}-${feature.timestamp}`,
            label: t('features.cumulativePayment'),
            details: numberFormatify(feature.totalPaymentAmount as number, { style: 'currency', currency }),
        },
    ]
    return [
        ...additionalFields,
        {
            key: `feature-extras-card-${feature.timestamp}-field-eff-date`,
            testId: `${FeaturesCardsTest.EffectiveDate}-${feature.timestamp}`,
            label: t('features.effectiveDate'),
            details: formatPolicyFeatureDate(feature.startDate),
        },
        {
            key: `feature-extras-card-${feature.timestamp}-field-exp-date`,
            testId: `${FeaturesCardsTest.ExpirationDate}-${feature.timestamp}`,
            label: t('features.expirationDate'),
            details: formatPolicyFeatureDate(feature.endDate),
        },
    ].map(createFieldKvp);
};

const mapRiderFields = (
    rider: Rider,
    riderBenefit: RiderBenefit,
    t: TFunction,
    currency: string,
    insuredContent: React.ReactNode
): ReactElement[] => {
    /*
        I use the rider's coverage id to get the benefit id instead of using the benefit id from riderBenefit
        because it could potentially be undefined/null. See below in this function for why I did this
    */
    const benefitId = CoverageToBenefitId[rider.coverageId as CoverageId];

    const fields: CardFields[] = [
        {
            customContent: insuredContent,
            details: '',
            key: `rider-extras-card-${rider.riderName}-field-insured`,
            label: t('riders.insured'),
            testId: `${RidersCardsTest.Insured}-${rider.riderName}`,
        },
        {
            details: convertKebabedDateString(rider.effectiveDate as string),
            key: `rider-extras-card-${rider.riderName}-field-effectiveDate`,
            label: t('riders.effectiveDate'),
            testId: `${RidersCardsTest.EffectiveDate}-${rider.riderName}`,
        },
        {
            details: convertKebabedDateString(rider.terminationDate as string),
            key: `rider-extras-card-${rider.riderName}-field-expirationDate`,
            label: t('riders.expirationDate'),
            testId: `${RidersCardsTest.ExpirationDate}-${rider.riderName}`,
        },
    ];

    if (!isNullEmptyOrUndefined(rider.claimStatus)) {
        fields.push({
            details: rider.claimStatus?.toString() ?? '',
            key: `rider-extras-card-${rider.riderName}-field-claimStatus`,
            label: t('riders.claimStatus'),
            testId: `${RidersCardsTest.ClaimStatus}-${rider.riderName}`,
        });
    }

    if (!isNullEmptyOrUndefined(rider.riderPaymentDate)) {
        fields.push({
            details: convertKebabedDateString(rider.riderPaymentDate as string),
            key: `rider-extras-card-${rider.riderName}-field-claimProcessedDate`,
            label: t('riders.claimProcessedDate'),
            testId: `${RidersCardsTest.ClaimProcessedDate}-${rider.riderName}`,
        });
    }

    if (!isNullEmptyOrUndefined(rider.terminalRiderPaymentAmount)) {
        fields.push({
            details: numberFormatify(rider.terminalRiderPaymentAmount as number, { style: 'currency', currency }),
            key: `rider-extras-card-${rider.riderName}-field-claimProcessed`,
            label: t('riders.claimProcessed'),
            testId: `${RidersCardsTest.ClaimProcessed}-${rider.riderName}`,
        });
    }

    /*
        1. Product API currently does not support max claims for OverloanProtection or Child riders
        2. The reason I use benefit ids here and not coverage ids is because products on Zahara can have different
        coverage ids for the same benefit. For example, a rider on a SBUL policy can have a coverage id of
        'Rider_SBLOPR' for overloan protection, but an Everly IUL policy will have a coverage id of 'Rider_OPR' 
        for the same thing.
    */
    if (benefitId !== BenefitId.OverloanProtection && benefitId !== BenefitId.Child) {
        fields.push({
            details: riderBenefit ? riderBenefit[ConfiguredSettingId.MaxNumberOfClaims]?.toString() : undefined,
            key: `rider-extras-card-${rider.riderName}-field-maxClaims`,
            label: t('riders.maxClaims'),
            testId: `${RidersCardsTest.MaxClaims}-${rider.riderName}`,
        });
    }

    return fields.map(createFieldKvp);
};

export const mapPolicyFeaturesToExtrasCards = (
    features: PolicyFeature[] | undefined,
    t: TFunction,
    currency = 'USD',
    isAnnuity = false
): PolicyExtrasCards[] | undefined => {
    return features?.filter(filterValidFeature).map(feature => {
        const { badge, status } = getBadgeFromFeature(feature, t);

        return {
            cardProps: {
                badge: badge,
                children: mapFeatureFields(feature, t, currency, isAnnuity),
                headerText: getFeatureHeader(feature, t),
                labelText: t('features.feature'),
                subheader: getFeatureSubheader(feature, t),
            },
            cardKey: `feature-extras-card-${feature.timestamp}-${feature.featureType}`,
            status,
            type: ExtrasCardType.Feature,
        };
    });
};

export const mapPolicyRidersToExtrasCards = (policyDetails: PolicyDetails | undefined, t: TFunction, riderBenefitData: RiderBenefit[] = []): PolicyExtrasCards[] => {
    if (!policyDetails?.riders) return [];

    return policyDetails.riders.map(rider => {
        const riderBenefit = riderBenefitData?.find(
            (benefit: RiderBenefit) => benefit?.benefitId === CoverageToBenefitId[rider.coverageId as CoverageId]
        ) as RiderBenefit;
        const insuredContent = getRiderInsuredContent(policyDetails, rider);
        const currency = policyDetails.currency || 'USD';
        const subheader = getRiderSubheader(rider, riderBenefit, t, currency);

        return {
            cardKey: `rider-extras-card-${rider.riderName}`,
            cardProps: {
                badge: getBadgeFromRider(rider, t),
                children: mapRiderFields(rider, riderBenefit, t, currency, insuredContent),
                headerText: toSentenceCase(rider.riderName as string),
                labelText: toSentenceCase(rider.type as string),
                subheader,
            },
            status: getRiderStatus(rider),
            type: ExtrasCardType.Rider,
        };
    });
};
