import { useQuery } from '@tanstack/react-query';
import { UserViewsGroupByEnum } from '@xd/api-types/dist/generated-types/analytics';
import { useState } from 'react';

import {
    calculateTickInterval,
    xAxisLabelFormatter,
} from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { Legend } from '@deps/components/dashboard/charts/date-time-chart/legend-for-date-time-chart/legend';
import { DateTimeLineChart } from '@deps/components/dashboard/charts/line-charts/date-time-line-chart';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import {
    defaultDateFormat,
    useUserRolesFilter,
} from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import SelectComponent from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getUserViewsCountsQuery } from '@deps/queries/tanstack/usage/usageQueries';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import PageViewsHeaderLayout from './page-views-header-layout';
import { tooltipFormatter } from './page-views-tooltip';
import {
    generateCSVFileName,
    generateSeries,
    roles,
    startDates,
    TimeframeFilterOptions,
} from './utils';

export const ZinniaLivePageViews = ({ title }: { title: string }) => {
    const [role, setRole] = useState('All');

    const rolesToPass = useUserRolesFilter({ role, roles });

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

    const colors = ['#0B7EAE', '#072838', '#6CC2F6'];

    const filter = {
        pageType: ['Cases', 'Policies'],
        dateStart: timerange.from,
        dateEnd: timerange.to,
        userRole: rolesToPass,
    };

    const {
        data: zinniaLivePageViewsData,
        isFetching: zinniaLivePageViewsDataFetching,
        isError: zinniaLivePageViewsDataError,
    } = useQuery({
        queryKey: ['zinniaLivePageViewsData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getUserViewsCountsQuery(filter, [
                UserViewsGroupByEnum.PAGE_TYPE,
                UserViewsGroupByEnum.ACTIVITY_DAY,
            ]),
    });

    const series = generateSeries(
        zinniaLivePageViewsData?.data,
        timerange,
        colors
    );

    const tickInterval = calculateTickInterval(timerange);
    const chartNotRenderable = zinniaLivePageViewsDataError || !series?.length;
    return (
        <div className="flex w-1/2 flex-col gap-4 px-8 py-8 rounded bg-white border border-gray-200 min-h">
            <PageViewsHeaderLayout
                title={title}
                data={zinniaLivePageViewsData?.data || []}
                csvFileName={generateCSVFileName(
                    'Zinnia Live',
                    role,
                    timerange,
                    'usage.tabs.pageViews'
                )}
            />
            <div className="flex items-center justify-between gap-4 w-full">
                <div className="mb-4 md:mb-0 md:w-1/3">
                    <SelectComponent
                        label="Role"
                        options={roles}
                        size={FieldSize.XS}
                        name="role-type-dropdown-btn"
                        onChange={setRole}
                        value={role}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div
                        className={
                            zinniaLivePageViewsDataFetching ? 'blur' : ''
                        }
                    >
                        <div className="flex items-center h-full mt-5">
                            <Typography variant={TypographyVariant.BodySm}>
                                {zinniaLivePageViewsData?.totalElements?.toLocaleString() ||
                                    '0'}{' '}
                                total
                            </Typography>
                        </div>
                    </div>
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
            </div>

            <BlurOverlayLoader loading={zinniaLivePageViewsDataFetching}>
                <div className="w-full flex-grow">
                    {chartNotRenderable ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography
                                variant={TypographyVariant.BodyBold}
                                className="mt-4 flex flex-row gap-2"
                            >
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {zinniaLivePageViewsDataError
                                    ? 'Something went wrong fetching the zinnia live unique logins, please try again by refreshing the page'
                                    : 'There is no data for this selection'}
                            </Typography>
                        </div>
                    ) : (
                        <DateTimeLineChart
                            series={series}
                            yAxisTitle={'Page Views'}
                            xAxisTitle={'Date'}
                            xAxisLabelFormatter={xAxisLabelFormatter}
                            tickInterval={tickInterval}
                            tooltipFormatter={tooltipFormatter}
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
