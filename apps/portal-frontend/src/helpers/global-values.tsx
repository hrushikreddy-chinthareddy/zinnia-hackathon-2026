import { TFunction } from 'next-i18next';

import { getBadgeStatus, getBadgeStatusVariant } from '@deps/components/badge/badge.helper';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helper';
import { GlobalValues } from '@deps/components/global-values/global-values.types';
import { formatDate } from '@deps/helpers/string.helper';
import { Policy, PolicyFeature, PolicyFeatureFeatureType, PolicyStatus } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { numberFormatify } from './numbers.helper';

export const getTotalMinRequiredAmount = (policyFeatures: PolicyFeature[]): number | string => {
    const foundFeature = policyFeatures?.find(feature => feature.featureType === ('LAPSEASSESSMENT' as PolicyFeatureFeatureType));
    const totalMinRequiredAmount = foundFeature?.totalMinimumRequiredAmount || DEFAULT_ERROR_STRING;
    return totalMinRequiredAmount;
};

export const policyDataToGlobalValues = (policy: Policy, t: TFunction) => {
    const policyId = policy?.policyNumber;
    const { policyStatus, policyFeatures = [], product, policyDates } = policy;
    const { generalLedgerPlanCode, marketingName, productType, planCode, planName } = product ?? {};

    const totalMinRequiredAmount = getTotalMinRequiredAmount(policyFeatures);

    const pendingLapse = policyFeatures?.find(pf => pf.featureType === ('LAPSEASSESSMENT' as PolicyFeatureFeatureType));
    const tooltipDate =
        policyStatus === PolicyStatus.LAPSE || policyStatus === PolicyStatus.PENDINGLAPSE
            ? formatDate(pendingLapse?.endDate)
            : formatDate(policyDates?.issueDate);

    const globalValues: GlobalValues = {
        carrierId: policy?.carrierId,
        marketingName,
        productType,
        planName,
        glPlanCode: generalLedgerPlanCode,
        planCode,
        policyNumber: policyId,
        status: t(getBadgeStatus(policyStatus)),
        variant: getBadgeStatusVariant(policyStatus),
        tooltip:
            t(getPolicyBadgeStatusTooltip(policyStatus), {
                tooltipDate: tooltipDate,
                tooltipAmount: numberFormatify(totalMinRequiredAmount),
            }) ?? '',
    };

    return globalValues;
};
