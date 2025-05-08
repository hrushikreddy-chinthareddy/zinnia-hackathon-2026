import { TFunction } from 'next-i18next';

import { getBadgeStatus, getBadgeStatusVariant } from '@deps/components/badge/badge.helpers';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helpers';
import { GlobalValues } from '@deps/components/global-values/global-values.types';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { formatDate } from '@deps/helpers/string.helpers';
import { PolicyFeatureFeatureType, PolicyStatus } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export const getTotalMinRequiredAmount = (policy: PolicyDetails): number | string => {
    const foundFeature = policy.features?.getFirstFeatureByType('LAPSEASSESSMENT' as PolicyFeatureFeatureType);
    return foundFeature?.totalMinimumRequiredAmount || DEFAULT_ERROR_STRING;
};

export const policyDataToGlobalValues = (policy: PolicyDetails, t: TFunction) => {
    const policyId = policy?.policyNumber;
    const { generalLedgerPlanCode, marketingName, productType, planCode, planName, policyStatus, issueDate } = policy;

    const totalMinRequiredAmount = getTotalMinRequiredAmount(policy);

    const pendingLapse = policy.features?.getFirstFeatureByType('LAPSEASSESSMENT' as PolicyFeatureFeatureType);
    const tooltipDate =
        policyStatus === PolicyStatus.LAPSE || policyStatus === PolicyStatus.PENDINGLAPSE
            ? formatDate(pendingLapse?.endDate)
            : formatDate(issueDate);

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
