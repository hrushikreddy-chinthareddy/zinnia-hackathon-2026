import { useQuery } from '@tanstack/react-query';
import { UserActivityGroupByEnum } from '@xd/api-types/dist/generated-types/analytics';
import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import { useState } from 'react';
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
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getUserActivityCountsQuery } from '@deps/queries/tanstack/usage/usageQueries';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import LoginsHeaderLayout from './logins-header-layout';
import { generateSeries, startDates, TimeframeFilterOptions } from './utils';

export const MyPolicyViewUniqueLogins = ({ title }: { title: string }) => {
    const { t } = useTranslation();
    const [timeframeRadio, setTimeframeRadio] = useState<
        TimeframeFilterOptions | undefined
    >(TimeframeFilterOptions.Last1Month);

    const [timerange, setTimerange] = useState({
        from: timeframeRadio !== undefined ? startDates[timeframeRadio] : '',
        to: dayjs().format(defaultDateFormat),
    });

    const handleTimeframeRadioChange = (value: TimeframeFilterOptions) => {
        setTimeframeRadio(value);
        setTimerange({
            from: startDates[value],
            to: dayjs().format(defaultDateFormat),
        });
    };
    const handleRangeChange = (value: { from: string; to: string }) => {
        setTimerange(value);
        setTimeframeRadio(undefined);
    };

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
        dateEnd: timerange.to || undefined,
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
            <LoginsHeaderLayout
                title={title}
                data={myPolicyViewLoginsData?.data ?? []}
                csvFileName={`MyPolicyView Unique Logins - ${timeframeRadio}onth`}
            />
            <div className="flex items-center justify-end gap-4">
                {myPolicyViewDataFetching ? (
                    <div className="blur">
                        <div className="flex items-center h-full mt-5">
                            <Typography variant={TypographyVariant.BodySm}>
                                {myPolicyViewLoginsData?.totalElements?.toLocaleString() ||
                                    '0'}{' '}
                                total
                            </Typography>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center h-full mt-5">
                        <Typography variant={TypographyVariant.BodySm}>
                            {myPolicyViewLoginsData?.totalElements?.toLocaleString() ||
                                '0'}{' '}
                            total
                        </Typography>
                    </div>
                )}

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
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography
                                variant={TypographyVariant.BodyBold}
                                className="mt-4 flex flex-row gap-2"
                            >
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {
                                    'Something went wrong fetching the my policy view unique logins , please try again by refreshing the page'
                                }
                            </Typography>
                        </div>
                    ) : series?.length === 0 ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography
                                variant={TypographyVariant.BodyBold}
                                className="mt-4 flex flex-row gap-2"
                            >
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {'There is no data for this selection'}
                            </Typography>
                        </div>
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
