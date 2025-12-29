import { Skeleton } from '@radix-ui/themes';
import { isObject } from '@rjsf/utils';
import dayjs from 'dayjs';
import { TFunction, I18n, i18n } from 'next-i18next';
import React, { ReactElement } from 'react';

import BadgeWithTooltip, {
    BadgeWithTooltipProps,
} from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import Content, { ContentVariant } from '@deps/components/content/content';
import { filterNullAndUndefined } from '@deps/components/dynamic-form/helpers/object.helpers';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { PolicyExtrasCardProps } from '@deps/components/policy-extras-card/policy-extras-card';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    getRiskClass,
    getSubstandardRating,
} from '@deps/helpers/party-info-helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import {
    isNullEmptyOrUndefined,
    toSentenceCase,
    convertKebabedDateString,
} from '@deps/helpers/string.helpers';
import {
    FeaturesCardsTest,
    RidersCardsTest,
} from '@deps/jest/constants/test-id-constants';
import {
    DEFAULT_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { ConfiguredSettingId } from '@deps/types/product-config-settings';
import {
    BenefitId,
    CoverageId,
    CoverageToBenefitId,
    RiderBenefit,
} from '@deps/types/product-rate';
import { formatTimestamp } from '@deps/utils/dates';
import {
    PartyStatus,
    PolicyFeature,
    FeatureType,
    Rider,
    SubStandardRating,
} from '@zinnia/api-types/types/sor';

import { RIDER_NOT_ELECTED } from './consts';
import { ExtrasCardType } from './policy-extras-cards';
import {
    ExtraFilters,
    filterValidFeature,
} from '../riders-and-features-sub-page/riders-and-features-sub-page.helpers';

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

export const riderTerminalIllnessSettings = [
    ConfiguredSettingId.MaxAmount,
    ConfiguredSettingId.MaxBenefitPercentage,
];

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
    details?: string | CardFields[];
    customContent?: React.ReactNode;
}

const getBadgeFromFeature = (
    feature: PolicyFeature,
    t: TFunction
): { badge: ReactElement<BadgeWithTooltipProps>; status: string } => {
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
    if (rider.riderElected === RIDER_NOT_ELECTED)
        return ExtraFilters.NotElected;

    switch (rider.status?.toLowerCase()) {
        case ExtraFilters.Active:
            return ExtraFilters.Available;
        case ExtraFilters.Pending:
            return ExtraFilters.Active;
        case ExtraFilters.Terminated:
            return ExtraFilters.Terminated;
        default:
            console.error(
                'getRiderStatus::Invalid or unsupported rider type',
                rider.status
            );
            return rider.status ?? '';
    }
};

const getBadgeFromRider = (
    rider: Rider,
    t: TFunction
): ReactElement<BadgeWithTooltipProps> => {
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
            console.error(
                'getBadgeFromRider::Invalid or unsupported rider type',
                rider.status
            );
            return null as unknown as ReactElement<BadgeWithTooltipProps>;
    }
};

const getRiderInsuredContent = (
    policyDetails: PolicyDetails,
    { riderName, riderParticipant }: Rider
): React.ReactNode => {
    const insuredIds = riderParticipant?.map(
        (participants) => participants.insuredId
    );

    if (!insuredIds?.length) {
        return (
            <Content
                details={DEFAULT_ERROR_STRING}
                variant={ContentVariant.Body}
            />
        );
    }

    const insuredElements = insuredIds.map((insuredId, index) => {
        const insuredParty = policyDetails.getPartyById(insuredId);

        // DEPU-3651 we need to filter out any party that has not been approved
        if (insuredParty?.party?.partyStatus === PartyStatus.NOTAPPROVED) {
            return null;
        }

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
        <div
            className="flex flex-col"
            data-testid={`${RidersCardsTest.Insured}-${riderName}-values`}
        >
            {insuredElements}
        </div>
    );
};

const getRiderSubheader = (
    rider: Rider,
    riderBenefitData: RiderBenefit,
    t: TFunction,
    currency: string
): (string | null)[] => {
    const currencyFormat: Intl.NumberFormatOptions = {
        style: 'currency',
        currency,
    };
    const integerFormat = { maximumFractionDigits: 0 };

    switch (riderBenefitData?.benefitId) {
        case BenefitId.ChronicIllness:
            return [
                riderBenefitData
                    ? toSentenceCase(
                          t('riders.chronicIllnessBenefit', {
                              percent: numberFormatify(
                                  riderBenefitData[
                                      ConfiguredSettingId.MaxBenefitPercentage
                                  ],
                                  integerFormat
                              ),
                              period: numberFormatify(
                                  riderBenefitData[
                                      ConfiguredSettingId.MaxNumberOfYearsToPay
                                  ],
                                  integerFormat
                              ),
                          }) as string
                      )
                    : null,
            ];

        case BenefitId.CriticalIllness:
            return [
                riderBenefitData
                    ? (t('riders.criticalIllnessBenefit1', {
                          t1Percent: numberFormatify(
                              riderBenefitData[
                                  ConfiguredSettingId.MaxBenefitPercentage
                              ],
                              integerFormat
                          ),
                          t1Amount: numberFormatify(
                              riderBenefitData[ConfiguredSettingId.MaxAmount],
                              currencyFormat
                          ),
                      }) as string)
                    : null,
                riderBenefitData
                    ? (t('riders.criticalIllnessBenefit2', {
                          t2Percent: numberFormatify(
                              riderBenefitData[
                                  ConfiguredSettingId.MaxBenefitPercentageT2
                              ],
                              integerFormat
                          ),
                          t2Amount: numberFormatify(
                              riderBenefitData[ConfiguredSettingId.MaxAmountT2],
                              currencyFormat
                          ),
                      }) as string)
                    : null,
            ];

        case BenefitId.TerminalIllness:
        case BenefitId.OverloanProtection:
        default:
            return [];
    }
};

const getFeatureHeader = (feature: PolicyFeature, t: TFunction): string => {
    switch (feature.featureType) {
        case FeatureType.LAPSEPROTECTION:
            return t('features.lapseProtection') as string;
        default:
            return feature.featureType ?? '';
    }
};

const getFeatureSubheader = (
    feature: PolicyFeature,
    t: TFunction
): (string | null)[] => {
    switch (feature.featureType) {
        case FeatureType.LAPSEPROTECTION:
            return [
                toSentenceCase(
                    t(
                        feature.period === 1
                            ? 'features.oneYearProtectionGuarantee'
                            : 'features.nYearsProtectionGuarantee',
                        {
                            n: feature.period,
                        }
                    ) as string
                ),
            ];
        default:
            return [];
    }
};

const createFieldKvp = ({
    key,
    testId,
    label,
    details,
    customContent,
}: CardFields): ReactElement | null => {
    if (Array.isArray(details)) {
        return null;
    }

    return (
        <span data-testid={testId} key={key}>
            <Label
                variant={LabelVariant.FieldLabel}
                label={label}
                sentenceCase={false}
            />
            <Skeleton
                loading={
                    isNullEmptyOrUndefined(details) &&
                    isNullEmptyOrUndefined(customContent)
                }
                minWidth="60px"
                maxWidth="100px"
                height="20px"
            >
                {customContent || (
                    <Content
                        details={details}
                        variant={ContentVariant.BodySm}
                    />
                )}
            </Skeleton>
        </span>
    );
};

const mapFeatureFields = (
    feature: PolicyFeature,
    t: TFunction,
    currency: string,
    isAnnuity = false
) => {
    const formatPolicyFeatureDate = (date: string | Date | undefined) => {
        if (date === '2999-12-31') return t('features.lifetime');
        return dayjs(date, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT);
    };

    const additionalFields = isAnnuity
        ? [
              {
                  // @ts-expect-error until spec is updated
                  key: `feature-extras-card-${feature.featureDescription}-field-description`,
                  testId: `${FeaturesCardsTest.Description}-${feature.timestamp}`,
                  label: t('features.featureDescription'),
                  // @ts-expect-error until spec is updated
                  details: feature.featureDescription,
              },
          ]
        : [
              {
                  key: `feature-extras-card-${feature.timestamp}-field-cost`,
                  testId: `${FeaturesCardsTest.Cost}-${feature.timestamp}`,
                  label: t('features.cost'),
                  details: numberFormatify(feature.paymentAmount as number, {
                      style: 'currency',
                      currency,
                  }),
              },
              {
                  key: `feature-extras-card-${feature.timestamp}-field-pmt`,
                  testId: `${FeaturesCardsTest.CumulativePayment}-${feature.timestamp}`,
                  label: t('features.cumulativePayment'),
                  details: numberFormatify(
                      feature.totalPaymentAmount as number,
                      { style: 'currency', currency }
                  ),
              },
          ];
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

export const cardFieldReducer =
    (
        t: TFunction,
        currency: string,
        insuredContent: React.ReactNode,
        keyLabel: string
    ) =>
    (acc: CardFields[] | [], array: [string, any]): CardFields[] => {
        const [key, value] = array;
        if (!Array.isArray(value) && !isObject(value)) {
            return [
                ...acc,
                {
                    key: `${keyLabel}-card-${key}-field`,
                    label: t(`${keyLabel}.${key}`) as string,
                    testId: `${keyLabel}-card-${key}`,
                    ...(key === 'riderName' // @TODO: There should be a follow up to decide what the insuredContent properties are - MR
                        ? {
                              customContent: insuredContent,
                              details: '',
                          }
                        : {
                              details: formatData(
                                  key,
                                  value,
                                  RiderFormatConfig // @TODO: This should be a param
                              ),
                          }),
                },
            ];
        } else if (Array.isArray(value) && !isObject(value)) {
            const processedDetails = value
                .map((item) => {
                    if (isObject(item)) {
                        return Object.entries(item)
                            .map((obj) =>
                                cardFieldReducer(
                                    t,
                                    currency,
                                    insuredContent,
                                    keyLabel
                                )([], obj)
                            )
                            .flat();
                    }
                })
                .flat() as CardFields[];
            return [
                ...acc,
                {
                    details: processedDetails,
                    key: `${keyLabel}-card-parent-${key}`,
                    label: t(`${keyLabel}.${key}`) as string,
                    testId: `${keyLabel}-card-parent-${key}`,
                },
            ];
        } else if (!Array.isArray(value) && isObject(value)) {
            const processedDetails = Object.entries(value)
                .map((item) => {
                    return cardFieldReducer(
                        t,
                        currency,
                        insuredContent,
                        keyLabel
                    )([], item);
                })
                .flat();
            return [
                ...acc,
                {
                    details: processedDetails,
                    key: `${keyLabel}-card-parent-${key}`,
                    label: t(`${keyLabel}.${key}`) as string,
                    testId: `${keyLabel}-card-parent-${key}`,
                },
            ];
        }
        return acc;
    };

export const mapRiderFields = (
    rider: Rider,
    t: TFunction,
    currency: string,
    insuredContent: React.ReactNode,
    keyLabel = 'riders'
) => {
    const fields = Object.entries(filterNullAndUndefined(rider)).reduce(
        cardFieldReducer(t, currency, insuredContent, keyLabel),
        []
    );
    return fields.map(createFieldKvp);
};

export const mapPolicyFeaturesToExtrasCards = (
    features: PolicyFeature[] | undefined,
    t: TFunction,
    currency = 'USD',
    isAnnuity = false
): PolicyExtrasCards[] | undefined => {
    return features?.filter(filterValidFeature).map((feature) => {
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

export const mapPolicyRidersToExtrasCards = (
    policyDetails: PolicyDetails | undefined,
    t: TFunction,
    riderBenefitData: Rider[] = []
): PolicyExtrasCards[] => {
    if (!policyDetails?.riders) return [];

    return policyDetails.riders.map((rider) => {
        const riderBenefit = riderBenefitData?.find(
            (benefit: Rider) =>
                benefit?.coverageId ===
                CoverageToBenefitId[rider.coverageId as CoverageId]
        ) as RiderBenefit;
        const insuredContent = getRiderInsuredContent(policyDetails, rider);
        const currency = policyDetails.currency || 'USD';
        const subheader = getRiderSubheader(rider, riderBenefit, t, currency);

        return {
            cardKey: `rider-extras-card-${rider.riderName}`,
            cardProps: {
                badge: getBadgeFromRider(rider, t),
                children: mapRiderFields(rider, t, currency, insuredContent),
                headerText: toSentenceCase(rider.riderName as string),
                labelText: toSentenceCase(rider.type as string),
                subheader,
                coverageId: rider.coverageId,
            },
            status: getRiderStatus(rider),
            type: ExtrasCardType.Rider,
        };
    });
};

export const formatBooleanToString = (value: boolean) => {
    const { t } = i18n as I18n;
    return t(`general.${!!value}`);
};

export const formatNumberToCurrency = (
    value: number,
    currency: string = 'USD'
) => numberFormatify(value, { style: 'currency', currency });

export const formatPercentageToString = (value: number) => `${value}%`;

export const convertToString = (val: any): string => `${val}`;

const customGetSubstandardRating = (value: string | undefined) => {
    const { t } = i18n as I18n;
    return getSubstandardRating(value as SubStandardRating, t);
};

export const getTranslationValues = (basePath: string) => (value: string) => {
    const { t } = i18n as I18n;
    return t(`${basePath}.${value}`) || value;
};

const convertElectionStatus = (value: 'NOTELECTED' | 'ELECTED') => {
    const { t } = i18n as I18n;
    if (value === 'NOTELECTED') {
        return t(`general.false`);
    }

    return t(`general.true`);
};

const RiderFormatConfig = {
    type: convertToString,
    riderName: convertToString,
    riderElected: convertElectionStatus,
    underwritingStatus: getTranslationValues(
        'policy.extras.riders.underwritingStatusValues'
    ), //enum
    unbornChildIndicator: formatBooleanToString,
    qualifiedAdditionalBenefit: formatBooleanToString,
    effectiveDate: convertKebabedDateString,
    exerciseDate: convertKebabedDateString,
    terminationDate: convertKebabedDateString,
    status: getTranslationValues('policy.extras.riders.statusValues'), //enum
    coverageId: convertToString,
    amount: formatNumberToCurrency,
    annualBenefitAmount: formatNumberToCurrency,
    riderBenefitAmount: formatNumberToCurrency,
    riderBenefitPercent: formatPercentageToString,
    minimumRiderBenefitAmount: formatNumberToCurrency,
    growthIncomeBenefitAmount: formatNumberToCurrency,
    riderStoredIncomeBalance: formatNumberToCurrency,
    insuredID: convertToString,
    insuredAgeAtIssue: convertToString,
    partyId: convertToString,
    partyAgeAtIssue: convertToString,
    riskClass: getRiskClass, //enum
    substandardRating: customGetSubstandardRating, //enum
    flatExtraType: getTranslationValues(
        'policy.extras.riders.flatExtraTypeValues'
    ), //enum
    flatExtraDuration: convertToString,
    flatExtraAmount: formatNumberToCurrency,
    flatExtraStartDate: convertKebabedDateString,
    riderExerciseCharge: formatNumberToCurrency,
    riderExerciseChargeRate: convertToString,
    maximumChronicIllnessBenefitPercentage: formatPercentageToString,
    maximumPeriodicPaymentPeriod: convertToString,
    claimStatus: formatBooleanToString,
    nextEvaluationDate: convertKebabedDateString,
    riderPaymentDate: convertKebabedDateString,
    terminalRiderPaymentAmount: formatNumberToCurrency,
    riderMinimumPaymentAmount: formatNumberToCurrency,
    maximumCriticalIllnessBenefitPercentage: formatPercentageToString,
    tierOneMaximumCriticalIllnessBenefitPercentage: formatPercentageToString,
    tierOneMaximumCriticalIllnessBenefitAmount: formatNumberToCurrency,
    tierTwoMaximumCriticalIllnessBenefitPercentage: formatPercentageToString,
    tierTwoMaximumCriticalIllnessBenefitAmount: formatNumberToCurrency,
    tierOneCriticalRiderPaymentDate: convertKebabedDateString,
    tierOneCriticalRiderPaymentAmount: formatNumberToCurrency,
    tierTwoCriticalRiderPaymentDate: convertKebabedDateString,
    tierTwoCriticalRiderPaymentAmount: formatNumberToCurrency,
    coverageType: getTranslationValues(
        'policy.extras.riders.coverageTypeValues'
    ), //enum
    coverageName: convertToString,
    productCode: convertToString,
    coverageTerm: convertToString,
    approvedCoverageAmount: formatNumberToCurrency,
    currentAmount: formatNumberToCurrency,
    originalCoverageAmount: formatNumberToCurrency,
    minimumCoverageAmount: formatNumberToCurrency,
    maximumCoverageAmount: formatNumberToCurrency,
    grossDeathBenefitAmount: formatNumberToCurrency,
    lowDeathBenefitAmount: formatNumberToCurrency,
    coverageChangeAmount: formatNumberToCurrency,
    coverageEffectiveDate: convertKebabedDateString,
    coverageChangeEffectiveDate: convertKebabedDateString,
    coverageTerminationDate: convertKebabedDateString,
    unitOfCoverage: convertToString,
    valuePerUnitOfCoverage: formatNumberToCurrency,
    guidelineSinglePremium: formatNumberToCurrency,
    guidelineLevelPremium: formatNumberToCurrency,
    sevenPayPremium: formatNumberToCurrency,
    modalPremium: formatNumberToCurrency,
    coverageTargetPremium: formatNumberToCurrency,
    annualPremium: formatNumberToCurrency,
    timestamp: formatTimestamp,
};

export const formatData = (
    key: string,
    value: string | number | boolean,
    config?: { [key: string]: (val: any) => string | undefined }
): string | undefined => {
    const formatter = config?.[key] ?? convertToString;
    return formatter(value);
};
