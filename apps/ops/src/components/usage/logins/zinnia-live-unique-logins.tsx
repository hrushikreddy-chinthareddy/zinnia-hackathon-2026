import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
    xAxisLabelFormatter,
    calculateTickInterval,
} from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { Legend } from '@deps/components/dashboard/charts/date-time-chart/legend-for-date-time-chart/legend';
import { tooltipFormatter } from '@deps/components/dashboard/charts/date-time-chart/line-chart-label';
import { DateTimeLineChart } from '@deps/components/dashboard/charts/line-charts/date-time-line-chart';
import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import { getUserActivityCountsQuery } from '@deps/queries/tanstack/usage/usageQueries';
import { startOfTomorrowLocalIso } from '@deps/utils/dates';
import { UserActivityGroupByEnum } from '@zinnia/api-types/types/analytics';

import { downloadUserActivityCSV, generateSeries } from './utils';
import { TotalCount } from '../total-count';
import UsageHeaderLayout from '../usage-common-header';
import {
    colors,
    generateCSVFileName,
    ApiRoles,
    startDates,
    TimeframeFilterOptions,
} from '../utils';

export const ZinniaLiveUniqueLogins = ({ title }: { title: string }) => {
    const { t } = useTranslation();

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
        userStatus: ['active'],
        systemSource: ['ZinniaLive'],
        userRole: [
            ApiRoles.Agent,
            ApiRoles.ZinniaCallCenter,
            ApiRoles.ZinniaOperations,
        ],
        dateStart: timerange.from,
        dateEnd: startOfTomorrowLocalIso(timerange.to) || undefined,
    };

    const {
        data: zinniaLiveLoginsData,
        isFetching: zinniaLiveLoginsDataFetching,
        isError: zinniaLiveLoginsDataError,
    } = useQuery({
        queryKey: ['zinniaLiveLoginsData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getUserActivityCountsQuery(filter, [
                UserActivityGroupByEnum.USER_ROLE,
                UserActivityGroupByEnum.ACTIVITY_DAY,
            ]),
    });

    const series = generateSeries(
        zinniaLiveLoginsData?.data,
        timerange,
        colors
    );
    const tickInterval = calculateTickInterval(timerange);
    return (
        <div className="flex w-1/2 flex-col gap-4 px-8 py-8 rounded bg-white border border-gray-200 min-h justify-between">
            <UsageHeaderLayout
                title={title}
                description={String(
                    t('usage.logins.zinniaLive.description') ?? ''
                )}
                data={zinniaLiveLoginsData?.data ?? []}
                csvFileName={generateCSVFileName({
                    title: 'Zinnia Live Unique Logins by Role',
                    timerange,
                })}
                csvFunction={downloadUserActivityCSV}
            />
            <div className="flex items-center justify-end gap-4">
                <TotalCount
                    isDataFetching={zinniaLiveLoginsDataFetching}
                    data={
                        zinniaLiveLoginsData ?? { data: [], totalElements: 0 }
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
            <BlurOverlayLoader loading={zinniaLiveLoginsDataFetching}>
                <div className="w-full flex-grow">
                    {zinniaLiveLoginsDataError ? (
                        <ErrorMessage />
                    ) : series?.length === 0 ? (
                        <NoDataMessage />
                    ) : (
                        <DateTimeLineChart
                            series={series}
                            yAxisTitle={
                                t('usage.logins.uniqueUsers') || 'Unique users'
                            }
                            xAxisTitle={t('usage.logins.date') || 'Date'}
                            xAxisLabelFormatter={xAxisLabelFormatter}
                            tickInterval={tickInterval}
                            tooltipFormatter={tooltipFormatter({
                                timerange,
                                isTooltipColorCircle: true,
                            })}
                            yAxisOpposite={false}
                        />
                    )}
                </div>
                <div className="w-full pl-2">
                    {series?.length !== 0 && (
                        <Legend
                            title={''}
                            colors={series.map((item) => item.color)}
                            labels={series.map((item) => item.name)}
                        />
                    )}
                </div>
            </BlurOverlayLoader>
        </div>
    );
};
