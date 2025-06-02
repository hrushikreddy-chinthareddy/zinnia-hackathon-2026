import { PolicyFeature, FeatureType } from '@zinnia/api-types/types/sor';
import dayjs, { Dayjs } from 'dayjs';

import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const isDateAllowed = (dayjsDate: Dayjs, startDate?: Dayjs, endDate?: Dayjs) => {
    const formattedDate = dayjs(dayjsDate, ZAHARA_API_DATE_FORMAT);
    const isStartDate = formattedDate.isSame(startDate, 'day');
    const isEndDate = formattedDate.isSame(endDate, 'day');
    const isAfterStartDate = formattedDate.isAfter(startDate, 'day');
    const isBeforeEndDate = formattedDate.isBefore(endDate, 'day');

    return isStartDate || isEndDate || (isAfterStartDate && isBeforeEndDate);
};

export const isPaymentAllowed = (payment: number | string, requiredPayment?: number) => {
    return !requiredPayment || Number(payment) >= requiredPayment;
};

export const getImportantDates = (policyFeatures?: PolicyFeature[]) => {
    const formatDate = (date?: string) => dayjs(date, ZAHARA_API_DATE_FORMAT);

    const lapseFeatures = policyFeatures?.find(pf => pf.featureType === FeatureType.LAPSEASSESSMENT);
    const reinstatementFeatures = policyFeatures?.find(pf => pf.featureType === FeatureType.REINSTATEMENT);

    const hasReinstatement = !!(
        reinstatementFeatures?.underwritingDecision &&
        reinstatementFeatures.startDate &&
        reinstatementFeatures.endDate &&
        reinstatementFeatures.paymentAmount
    );
    const hasLapse = !!(lapseFeatures?.status && lapseFeatures.startDate && lapseFeatures.endDate && lapseFeatures.paymentAmount);

    let startDate: Dayjs | undefined;
    let endDate: Dayjs | undefined;
    let requiredPayment: number | undefined;

    if (hasReinstatement) {
        startDate = formatDate(reinstatementFeatures.approvalDate);
        endDate = formatDate(reinstatementFeatures.endDate);
        requiredPayment = reinstatementFeatures.paymentAmount;
    } else if (hasLapse) {
        startDate = formatDate(lapseFeatures.startDate);
        endDate = formatDate(lapseFeatures.endDate);
        requiredPayment = lapseFeatures.paymentAmount;
    }

    return {
        hasLapse,
        hasReinstatement,
        startDate,
        endDate,
        requiredPayment,
    };
};
