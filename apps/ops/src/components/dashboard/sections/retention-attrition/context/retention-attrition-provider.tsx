import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FC, PropsWithChildren, useMemo, useState } from 'react';

import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import {
    defaultDateFormat,
    startDates,
} from '@deps/components/dashboard/utils';
import { CaseMetricType, Statuses } from '@deps/models/case/case';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import {
    CaseCountGroupByEnum,
    CaseCountInputFilter,
} from '@zinnia/api-types/types/analytics';

import { RetentionAttritionContext } from './retention-attrition-context';
import {
    organizePieChartData,
    RetentionAttritionTimeRange,
    transformRetentionAttritionData,
} from '../utils';

const ChartFilterOption = {
    PIE: 'PIE',
    TABLE: 'TABLE',
} as const;

export const RetentionAttritionProvider: FC<PropsWithChildren> = ({
    children,
}) => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );

    const [selectedMetricType, setSelectedMetricType] =
        useState<CaseMetricType>(CaseMetricType.Retention);

    const {
        timeframeRadio,
        timerange,
        handleTimeframeRadioChange,
        handleRangeChange,
    } = useTimeRangeFilter<RetentionAttritionTimeRange>({
        startDates,
        defaultOption: RetentionAttritionTimeRange.Trailing12Months,
        dateFormat: defaultDateFormat,
    });

    const getFilter = (type: keyof typeof ChartFilterOption) => {
        const retention_attrition_notIssued =
            type === ChartFilterOption.PIE
                ? [CaseMetricType.Attrition, CaseMetricType.Retention]
                : [selectedMetricType];

        const baseFilter: CaseCountInputFilter = {
            createdDateStart: timerange.from,
            createdDateEnd: dayjs(timerange.to).add(1, 'day').toISOString(),
            caseStatus: [Statuses.Completed],
            retention_attrition_notIssued,
        };

        if (Object.keys(selectedCarriers).length > 0) {
            baseFilter.carrier = selectedCarriers;
        }

        if (Object.keys(selectedBrokerDealers).length > 0) {
            baseFilter.brokerDealerName = selectedBrokerDealers;
        }

        return baseFilter;
    };

    const filter = getFilter(ChartFilterOption.TABLE);

    const {
        data: retentionAttritionRawData,
        isFetching: retentionAttritionDataFetching,
        isLoading: retentionAttritionDataLoading,
        isError: retentionAttritionDataError,
    } = useQuery({
        queryKey: ['retentionAttritionData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getCaseDashboardStatsQuery(filter, [
                CaseCountGroupByEnum.PRODUCT_NAME,
                CaseCountGroupByEnum.MAP_CONTRACT_STATUS,
            ]),
        enabled: !!timerange.from && !!timerange.to,
    });

    // Transform API data to UI format
    const retentionAttritionData = useMemo(() => {
        if (!retentionAttritionRawData?.data) return undefined;
        return transformRetentionAttritionData(retentionAttritionRawData.data);
    }, [retentionAttritionRawData]);

    // Fetching pie data
    const pieFilter = getFilter(ChartFilterOption.PIE);

    const {
        data: retentionAttritionPieData,
        isFetching: retentionAttritionPieDataFetching,
    } = useQuery({
        queryKey: ['retentionAttritionPieData', pieFilter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getCaseDashboardStatsQuery(pieFilter, [
                CaseCountGroupByEnum.RETENTION_ATTRITION_NOT_ISSUED,
            ]),
        enabled: !!timerange.from && !!timerange.to,
    });

    const metricData = useMemo(
        () => organizePieChartData(retentionAttritionPieData),
        [retentionAttritionPieData]
    );

    const pieSeries = useMemo(
        () => [
            {
                name: 'Retention & Attrition',
                data: metricData,
            },
        ],
        [metricData]
    );

    const pieInformation = useMemo(() => {
        let timeDiff = dayjs(timerange.to).diff(dayjs(timerange.from), 'month');
        let timeUnit = `month`;

        if (timeDiff < 1) {
            timeDiff = dayjs(timerange.to).diff(dayjs(timerange.from), 'day');
            timeUnit = 'day';
        }

        let descriptionCopy = `past ${timeDiff} ${timeUnit}${
            timeDiff > 1 ? 's' : ''
        }`;

        // Filter in same day
        if (!timeDiff) {
            descriptionCopy = 'the day';
        }

        const metric = metricData.find((m) => m.name === selectedMetricType);

        return {
            title: `${metric?.y || ''} %`,
            description: `${selectedMetricType || ''} ${descriptionCopy}`,
        };
    }, [selectedMetricType, metricData, timerange]);

    return (
        <RetentionAttritionContext.Provider
            value={{
                timeframeRadio,
                handleTimeframeRadioChange,
                timerange,
                handleRangeChange,
                selectedMetricType,
                setSelectedMetricType,
                filter,
                retentionAttritionData,
                retentionAttritionDataLoading,
                retentionAttritionDataError,
                retentionAttritionDataFetching,
                pieSeries,
                retentionAttritionPieDataFetching,
                pieInformation,
            }}
        >
            {children}
        </RetentionAttritionContext.Provider>
    );
};
