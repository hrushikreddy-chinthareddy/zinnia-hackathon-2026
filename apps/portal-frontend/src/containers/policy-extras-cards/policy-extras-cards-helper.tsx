import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';
import React, { Fragment, ReactElement } from 'react';

import BadgeWithTooltip, { BadgeWithTooltipProps } from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PolicyExtrasCardProps } from '@deps/components/policy-extras-card/policy-extras-card';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { getFullName } from '@deps/helpers/party-info-helper';
import { convertKebabedDateString, isNullEmptyOrUndefined, toSentenceCase } from '@deps/helpers/string.helper';
import { FeaturesCardsTest, RidersCardsTest } from '@deps/jest/constants/test-id-constants';
import { Policy, PolicyAllOfPartiesItem, PolicyFeature, PolicyFeatureFeatureType, Rider } from '@deps/models/policy/sor-policy';
import { DEFAULT_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { ExtrasCardType } from './policy-extras-cards';
import { ExtraFilters, filterValidFeature } from '../policy-extras-sub-page/policy-extras-sub-page.helper';

export enum CoverageId {
    ChronicIllness = 'Rider_SBLCHR',
    CriticalIllness = 'Rider_SBLCRI',
    TerminalIllness = 'Rider_SBLTRM',
    OverloanProtection = 'Rider_SBLOPR',
}

type PolicyExtrasCards = {
    cardKey: string;
    cardProps: PolicyExtrasCardProps;
    status: string;
    type: ExtrasCardType;
};

interface RiderSubheader {
    sentence1?: string;
    sentence2?: string;
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
    { parties = [], partyRoles = [], policyNumber, product = {} }: Policy,
    { riderName, riderParticipant }: Rider
): React.ReactNode => {
    const insuredIds = riderParticipant?.map(participants => participants.insuredId);

    if (!insuredIds?.length) {
        return <Content details={DEFAULT_ERROR_STRING} variant={ContentVariant.Body} />;
    }

    const insuredElements = insuredIds.map((insuredId, index) => {
        const insuredParty = parties.find(party => party.partyId === insuredId);
        const activeInsuredPartyRoles = partyRoles.filter(role => {
            if (role.partyId !== insuredId) {
                return false;
            }

            if (role.startDate && dayjs(role.startDate, 'YYYY-MM-DD').isAfter(dayjs())) {
                return false;
            }

            if (role.endDate && dayjs(role.endDate, 'YYYY-MM-DD').isBefore(dayjs())) {
                return false;
            }

            return true;
        });

        if (!activeInsuredPartyRoles.length || !insuredParty?.partyId) {
            return (
                <Content
                    details={getFullName(insuredParty as PolicyAllOfPartiesItem)}
                    key={`insured-${insuredId}-${index}`}
                    variant={ContentVariant.Body}
                    pii={true}
                />
            );
        }

        return (
            <NavElement
                key={`insured-${insuredId}`}
                href={`/policies/${product.planCode}/${policyNumber}/people/${insuredParty.partyId}`}
                size={NavElementSize.Small}
                type={NavElementType.Link}
            >
                <PiiWrapper>{getFullName(insuredParty as PolicyAllOfPartiesItem)}</PiiWrapper>
            </NavElement>
        );
    });

    return (
        <div className="flex flex-col" data-testid={`${RidersCardsTest.Insured}-${riderName}-values`}>
            {insuredElements}
        </div>
    );
};

const getRiderSubheader = (rider: Rider, t: TFunction, currency: string): RiderSubheader[] | null => {
    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };
    const integerFormat = { maximumFractionDigits: 0 };

    switch (rider.coverageId) {
        case CoverageId.ChronicIllness:
            return [
                {
                    sentence1: toSentenceCase(
                        t('riders.chronicIllnessBenefit', {
                            percent: numberFormatify(rider.maximumChronicIllnessBenefitPercentage, integerFormat),
                            period: numberFormatify(rider.maximumPeriodicPaymentPeriod, integerFormat),
                        }) as string
                    ),
                    sentence2: undefined,
                },
            ];
        case CoverageId.CriticalIllness:
            return [
                {
                    sentence1: t('riders.criticalIllnessBenefit1', {
                        t1Percent: numberFormatify(rider.tierOneMaximumCriticalIllnessBenefitPercentage, integerFormat),
                        t1Amount: numberFormatify(rider.tierOneMaximumCriticalIllnessBenefitAmount, currencyFormat),
                    }) as string,
                    sentence2: t('riders.criticalIllnessBenefit2', {
                        t2Percent: numberFormatify(rider.tierTwoMaximumCriticalIllnessBenefitPercentage, integerFormat),
                        t2Amount: numberFormatify(rider.tierTwoMaximumCriticalIllnessBenefitAmount, currencyFormat),
                    }) as string,
                },
            ];

        case CoverageId.TerminalIllness:
        case CoverageId.OverloanProtection:
        default:
            return null;
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

const getFeatureSubheader = (feature: PolicyFeature, t: TFunction): string | null => {
    switch (feature.featureType) {
        case 'LAPSEPROTECTION' as PolicyFeatureFeatureType:
            return toSentenceCase(
                t(feature.period === 1 ? 'features.oneYearProtectionGuarantee' : 'features.nYearsProtectionGuarantee', {
                    n: feature.period,
                }) as string
            );
        default:
            return null;
    }
};

const createFieldKvp = ({
    key,
    testId,
    label,
    details,
    customContent,
}: {
    key: string;
    testId: string;
    label: string;
    details: string;
    customContent?: React.ReactNode;
}) => {
    return (
        <span data-testid={testId} key={key}>
            <Label variant={LabelVariant.FieldLabel} label={label} />
            {customContent || <Content details={details} variant={ContentVariant.BodySm} />}
        </span>
    );
};

const mapFeatureFields = (feature: PolicyFeature, t: TFunction, currency: string): ReactElement[] => {
    return [
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
        {
            key: `feature-extras-card-${feature.timestamp}-field-eff-date`,
            testId: `${FeaturesCardsTest.EffectiveDate}-${feature.timestamp}`,
            label: t('features.effectiveDate'),
            details: dayjs(feature.startDate, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT),
        },
        {
            key: `feature-extras-card-${feature.timestamp}-field-exp-date`,
            testId: `${FeaturesCardsTest.ExpirationDate}-${feature.timestamp}`,
            label: t('features.expirationDate'),
            details: dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT),
        },
    ].map(createFieldKvp);
};

const mapRiderFields = (rider: Rider, t: TFunction, currency: string, insuredContent: React.ReactNode): ReactElement[] => {
    const fields = [
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

    return fields.map(createFieldKvp);
};

export const mapPolicyFeaturesToExtrasCards = (
    features: PolicyFeature[] | undefined,
    t: TFunction,
    currency = 'USD'
): PolicyExtrasCards[] | undefined => {
    return features?.filter(filterValidFeature).map(feature => {
        const { badge, status } = getBadgeFromFeature(feature, t);

        return {
            cardProps: {
                badge: badge,
                children: mapFeatureFields(feature, t, currency),
                headerText: getFeatureHeader(feature, t),
                labelText: t('features.feature'),
                subheaderNode: <Content variant={ContentVariant.Body} details={getFeatureSubheader(feature, t) as string} />,
            },
            cardKey: `feature-extras-card-${feature.timestamp}`,
            status,
            type: ExtrasCardType.Feature,
        };
    });
};

export const mapPolicyRidersToExtrasCards = (policy: Policy, t: TFunction): PolicyExtrasCards[] => {
    if (!policy.riders) return [];

    return policy.riders.map(rider => {
        const insuredContent = getRiderInsuredContent(policy, rider);
        const currency = policy.currency || 'USD';
        const subheader = getRiderSubheader(rider, t, currency);

        let subheaderNode;

        if (subheader && subheader[0].sentence2) {
            subheaderNode = (
                <>
                    {subheader.map((sub, index) => (
                        <Fragment key={index}>
                            <Typography variant={TypographyVariant.Body}>{sub.sentence1}</Typography>
                            <Typography variant={TypographyVariant.Body}>{sub.sentence2}</Typography>
                        </Fragment>
                    ))}
                </>
            );
        } else {
            subheaderNode = (
                <Typography variant={TypographyVariant.Body}>{subheader ? subheader[0].sentence1 : DEFAULT_ERROR_STRING}</Typography>
            );
        }

        return {
            cardKey: `rider-extras-card-${rider.riderName}`,
            cardProps: {
                badge: getBadgeFromRider(rider, t),
                children: mapRiderFields(rider, t, currency, insuredContent),
                headerText: toSentenceCase(rider.riderName as string),
                labelText: toSentenceCase(rider.type as string),
                subheaderNode: subheaderNode,
            },
            status: getRiderStatus(rider),
            type: ExtrasCardType.Rider,
        };
    });
};
