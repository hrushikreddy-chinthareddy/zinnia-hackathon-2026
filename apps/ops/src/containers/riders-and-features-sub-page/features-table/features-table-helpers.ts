import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { toSentenceCase } from '@deps/helpers/string.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { FeatureType, PolicyFeature } from '@zinnia/api-types/types/sor';

export const filterValidFeature = (feature: PolicyFeature) =>
    feature.startDate &&
    feature.endDate &&
    dayjs(feature.startDate, ZAHARA_API_DATE_FORMAT).isValid() &&
    dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isValid();

export const getFeatureStatusText = (
    feature: PolicyFeature,
    t: TFunction
): string => {
    if (dayjs(feature.endDate, ZAHARA_API_DATE_FORMAT).isBefore(dayjs())) {
        return toSentenceCase(t('policy.extras.features.terminated') as string);
    }
    if (feature.approvalDate) {
        return toSentenceCase(t('policy.extras.features.active') as string);
    }
    return toSentenceCase(t('policy.extras.features.available') as string);
};

export const getFeatureNameText = (
    feature: PolicyFeature,
    t: TFunction
): string => {
    switch (feature.featureType) {
        case FeatureType.LAPSEPROTECTION:
            return t('policy.extras.features.lapseProtection') as string;
        default:
            return (
                toSentenceCase(
                    t(`enums.${feature.featureType}`, {
                        defaultValue: feature.featureType,
                    }) as string
                ) ?? DEFAULT_ERROR_STRING
            );
    }
};
