import { useQuery } from '@tanstack/react-query';
import { UserViewsGroupByEnum } from '@xd/api-types/dist/generated-types/analytics';
import { generateNewColor } from '@xd/utils/dist';
import { SeriesOptionsType } from 'highcharts';
import { useMemo } from 'react';

import { StackedColumnChart } from '@deps/components/dashboard/charts/bar-charts/stacked-column-chart';
import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import { Legend } from '@deps/components/dashboard/legend/legend';
import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import { getUserViewsCountsQuery } from '@deps/queries/tanstack/usage/usageQueries';

import {
    PrepareTransactionsByRoleCSV,
    TimeframeFilterOptions,
    generateChartSeries,
    getCategories,
    startDates,
} from './utlis';
import { TotalCount } from '../total-count';
import UsageHeaderLayout from '../usage-common-header';
import { colors, generateCSVFileName } from '../utils';

export const Activity = () => {
    const {
        timeframeRadio,
        timerange,
        handleTimeframeRadioChange,
        handleRangeChange,
    } = useTimeRangeFilter<TimeframeFilterOptions>({
        startDates,
        defaultOption: TimeframeFilterOptions.Last1Month,
        dateFormat: defaultDateFormat,
    });

    const filter = {
        pageType: ['Cases'],
        dateStart: timerange.from,
        dateEnd: timerange.to,
    };

    const {
        data: zinniaSubmittedTransactionByRoleData,
        isFetching: zinniaSubmittedTransactionByRoleDataFetching,
        isError: zinniaSubmittedTransactionByRoleDataError,
    } = useQuery({
        queryKey: ['zinniaSubmittedTransactionByRoleData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getUserViewsCountsQuery(filter, [
                UserViewsGroupByEnum.USER_ROLE,
                UserViewsGroupByEnum.PROCESS,
            ]),
    });

    const categories = getCategories(
        zinniaSubmittedTransactionByRoleData?.data || []
    );
    const chartSeries = generateChartSeries(
        zinniaSubmittedTransactionByRoleData?.data || [],
        categories
    );

    const legendItemsNew = useMemo(() => {
        return (
            chartSeries?.map((item, index) => {
                const color = colors[index] ?? generateNewColor(colors);
                if (!colors.includes(color)) {
                    colors.push(color);
                }
                return {
                    label: item.name,
                    color,
                };
            }) || []
        );
    }, [chartSeries]);

    const chartNotRenderable =
        zinniaSubmittedTransactionByRoleDataError || !chartSeries?.length;
    return (
        <div className="flex gap-4 m-4">
            <div className="flex w-full flex-col gap-4 px-8 py-8 rounded bg-white border border-gray-200 min-h justify-between">
                <UsageHeaderLayout
                    title={'Submitted Transaction by Role'}
                    data={zinniaSubmittedTransactionByRoleData?.data || []}
                    csvFileName={generateCSVFileName(
                        'Submitted Transactions by Role',
                        timerange
                    )}
                    csvFunction={PrepareTransactionsByRoleCSV}
                />
                <div className="flex items-center justify-end gap-4">
                    <TotalCount
                        isDataFetching={
                            zinniaSubmittedTransactionByRoleDataFetching
                        }
                        data={
                            zinniaSubmittedTransactionByRoleData ?? {
                                data: [],
                                totalElements: 0,
                            }
                        }
                    />

                    <TimeFilter
                        defaultValue={timeframeRadio}
                        onRadioChange={(val) =>
                            handleTimeframeRadioChange(
                                val as TimeframeFilterOptions
                            )
                        }
                        controlledTimeValue={timeframeRadio}
                        timerange={timerange}
                        handleTimerangeChange={handleRangeChange}
                        timeframeOptions={TimeframeFilterOptions}
                    />
                </div>
                <BlurOverlayLoader
                    loading={zinniaSubmittedTransactionByRoleDataFetching}
                >
                    {chartNotRenderable ? (
                        zinniaSubmittedTransactionByRoleDataError ? (
                            <ErrorMessage />
                        ) : (
                            <NoDataMessage />
                        )
                    ) : (
                        <>
                            <StackedColumnChart
                                series={chartSeries as SeriesOptionsType[]}
                                categories={categories}
                                colors={colors}
                                yAxisTitle="Submitted transaction count"
                                xAxisTitle="Transaction type"
                                xAxisLabelRoatationRequired
                            />
                            <Legend items={legendItemsNew} title="" />
                        </>
                    )}
                </BlurOverlayLoader>
            </div>
        </div>
    );
};
