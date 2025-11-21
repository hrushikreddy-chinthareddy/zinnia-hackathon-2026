import { useQuery } from '@tanstack/react-query';
import Highcharts from 'highcharts';
import { renderToStaticMarkup } from 'react-dom/server';
import { useTranslation } from 'react-i18next';

import {
    xAxisLabelFormatter,
    calculateTickInterval,
    calculateTooltipRanges,
    getTooltipData,
} from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { LabelComponent } from '@deps/components/dashboard/charts/date-time-chart/label-for-chart-for-time/label';
import { Legend } from '@deps/components/dashboard/charts/date-time-chart/legend-for-date-time-chart/legend';
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

import {
    downloadUserActivityCSV,
    generateSeries,
    startDates,
    TimeframeFilterOptions,
} from './utils';
import { TotalCount } from '../total-count';
import UsageHeaderLayout from '../usage-common-header';
import { generateCSVFileName } from '../utils';

export const MyPolicyViewUniqueLogins = ({ title }: { title: string }) => {
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

    const tooltipFormatter: Highcharts.TooltipFormatterCallbackFunction =
        function (this) {
            const points = this.points;
            const dateStr = calculateTooltipRanges(this, timerange);
            const tooltipData = getTooltipData(points) || '';

            return renderToStaticMarkup(
                <LabelComponent
                    labelData={tooltipData.labelData}
                    dateStr={dateStr}
                    total={tooltipData.total ?? 0}
                />
            );
        };

    const filter = {
        userRole: ['Customer'],
        userStatus: ['active'],
        systemSource: ['MyPolicyView'],
        dateStart: timerange.from,
        dateEnd: startOfTomorrowLocalIso(timerange.to) || undefined,
    };

    const {
        data: myPolicyViewLoginsData,
        isFetching: myPolicyViewDataFetching,
        isError: myPolicyViewDataError,
    } = useQuery({
        queryKey: ['myPolicyViewLoginsData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getUserActivityCountsQuery(filter, [
                UserActivityGroupByEnum.USER_ROLE,
                UserActivityGroupByEnum.ACTIVITY_DAY,
            ]),
    });

    const series = generateSeries(myPolicyViewLoginsData?.data, timerange, [
        '#C0C64F',
    ]);
    const tickInterval = calculateTickInterval(timerange);
    return (
        <div className="flex w-1/2 flex-col gap-4 px-8 py-8 rounded bg-white border border-gray-200 min-h justify-between">
            <UsageHeaderLayout
                title={title}
                description={String(
                    t('usage.logins.myPolicyView.description') ?? ''
                )}
                data={myPolicyViewLoginsData?.data ?? []}
                csvFileName={generateCSVFileName(
                    'MyPolicyView Unique Logins',
                    timerange
                )}
                csvFunction={downloadUserActivityCSV}
            />
            <div className="flex items-center justify-end gap-4">
                <TotalCount
                    isDataFetching={myPolicyViewDataFetching}
                    data={
                        myPolicyViewLoginsData ?? { data: [], totalElements: 0 }
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
            <BlurOverlayLoader loading={myPolicyViewDataFetching}>
                <div className="w-full flex-grow">
                    {myPolicyViewDataError ? (
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
                            tickInterval={tickInterval}
                            xAxisLabelFormatter={xAxisLabelFormatter}
                            tooltipFormatter={tooltipFormatter}
                            yAxisOpposite={false}
                        />
                    )}
                </div>
                <div className="w-full pl-2">
                    {series?.length !== 0 && (
                        <Legend
                            colors={series.map((item) => item.color)}
                            labels={series.map((item) => item.name)}
                        />
                    )}
                </div>
            </BlurOverlayLoader>
        </div>
    );
};
