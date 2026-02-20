import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { TFunction } from 'next-i18next';

import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { CaseMetricType } from '@deps/models/case/case';
import {
    CaseCountOutput,
    CaseCountOutputLevel1,
} from '@zinnia/api-types/types/analytics';

export enum RetentionAttritionTimeRange {
    Last1Month = '1M',
    Last3Months = '3M',
    Last6Months = '6M',
    Trailing12Months = '12M',
}

export const startDates: Record<RetentionAttritionTimeRange, string> = {
    [RetentionAttritionTimeRange.Trailing12Months]: dayjs()
        .subtract(12, 'month')
        .format(defaultDateFormat),
    [RetentionAttritionTimeRange.Last6Months]: dayjs()
        .subtract(6, 'month')
        .format(defaultDateFormat),
    [RetentionAttritionTimeRange.Last3Months]: dayjs()
        .subtract(3, 'month')
        .format(defaultDateFormat),
    [RetentionAttritionTimeRange.Last1Month]: dayjs()
        .subtract(1, 'month')
        .format(defaultDateFormat),
};

export interface TypeOrganizedData {
    name: string;
    count: number[];
    countByType: {
        [key: string]: number;
    };
    total: number;
}

export type TypeRangeData = Record<
    CaseMetricType,
    { data: TypeOrganizedData[]; total: number }
>;

dayjs.extend(isBetween);

export interface FlattenedRetentionAttritionData {
    productName: string;
    status: string;
    count: number;
}

// Processing times data structure from context
export interface RetentionAttritionData {
    productName: string;
    status: string;
    policyContract: {
        productName: string;
        status: string;
        count: number;
    }[];
    total: number;
}

export const flattenRetentionAttritionData = (
    retentionAttritionData: RetentionAttritionData[] | undefined
): FlattenedRetentionAttritionData[] => {
    if (!retentionAttritionData) return [];

    const flattened: FlattenedRetentionAttritionData[] = [];
    retentionAttritionData.forEach((policyContract) => {
        flattened.push({
            productName: policyContract.productName,
            status: 'All',
            count: policyContract.total,
        });
        policyContract.policyContract.forEach((pC) => {
            flattened.push({
                productName: policyContract.productName,
                status: pC.status,
                count: pC.count,
            });
        });
    });

    return flattened;
};

export const generateCsvColumns = (
    t: TFunction
): { label: string; key: keyof FlattenedRetentionAttritionData }[] => {
    return [
        { label: t('allFields.productName'), key: 'productName' },
        { label: t('allFields.policyContractStatus'), key: 'status' },
        { label: t('allFields.count'), key: 'count' },
    ];
};

export const generateRetentionAttritionCSVFilename = (
    carrierName: string,
    timerange: { from: string; to: string },
    t: TFunction
): string => {
    const fromDate = dayjs(timerange.from).format(defaultDateFormat);
    const toDate = dayjs(timerange.to).format(defaultDateFormat);

    return `${t('allFields.retentionAttritionFilename', {
        carrierName,
        fromDate,
        toDate,
    })}.csv`;
};

/**
 * This method calculate the percentage of both metrics in data
 *
 * @param data Data filtered by timerange
 * @returns Data information for both metrics: Retention and Attrition
 */
export const organizePieChartData = (data: CaseCountOutput | undefined) => {
    return Object.entries(data?.data || []).map(([_, value]) => {
        const percentage = Math.round(
            (value.count / (data?.totalElements || 0)) * 100
        );

        return {
            name: value.name,
            y: percentage,
        };
    });
};

export const isTimeFrameFilterOption = (
    value: string
): value is RetentionAttritionTimeRange => {
    return Object.values(RetentionAttritionTimeRange)
        .map(String)
        .includes(value);
};

export const transformRetentionAttritionData = (
    apiData: CaseCountOutputLevel1[]
): RetentionAttritionData[] => {
    return apiData.map((data) => ({
        productName: data.name,
        status: data.name,
        policyContract: (data.values || []).map((v) => ({
            productName: v.name,
            status: v.name,
            count: v.count,
        })),
        total: data.count,
    }));
};
