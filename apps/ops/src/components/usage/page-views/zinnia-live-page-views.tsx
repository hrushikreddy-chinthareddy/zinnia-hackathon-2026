import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    calculateTickInterval,
    xAxisLabelFormatter,
} from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { Legend } from '@deps/components/dashboard/charts/date-time-chart/legend-for-date-time-chart/legend';
import { DateTimeLineChart } from '@deps/components/dashboard/charts/line-charts/date-time-line-chart';
import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import {
    defaultDateFormat,
    useUserRolesFilter,
} from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import SelectComponent from '@deps/components/select/select';
import { getUserViewsCountsQuery } from '@deps/queries/tanstack/usage/usageQueries';
import { startOfTomorrowLocalIso } from '@deps/utils/dates';
import { UserViewsGroupByEnum } from '@zinnia/api-types/types/analytics';

import { tooltipFormatter } from './page-views-tooltip';
import {
    generateSeries,
    PrepareUserViewsCSV,
    roles,
    startDates,
    TimeframeFilterOptions,
} from './utils';
import { TotalCount } from '../total-count';
import UsageHeaderLayout from '../usage-common-header';
import { colors, generateCSVFileName, PageType } from '../utils';

export const ZinniaLivePageViews = ({ title }: { title: string }) => {
    const { t } = useTranslation();
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

    const filter = {
        pageType: [PageType.Cases, PageType.Illustrations, PageType.Policies],
        dateStart: timerange.from,
        dateEnd: startOfTomorrowLocalIso(timerange.to) || undefined,
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
            <UsageHeaderLayout
                title={title}
                description={String(
                    t('usage.pageViews.zinniaLivePageViews.description') ?? ''
                )}
                data={zinniaLivePageViewsData?.data || []}
                csvFileName={generateCSVFileName({
                    title: 'Zinnia Live',
                    timerange,
                    role,
                    optionaltitle: t('usage.tabs.pageViews') ?? '',
                })}
                csvFunction={PrepareUserViewsCSV}
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
                    <TotalCount
                        isDataFetching={zinniaLivePageViewsDataFetching}
                        data={
                            zinniaLivePageViewsData ?? {
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
            </div>

            <BlurOverlayLoader loading={zinniaLivePageViewsDataFetching}>
                <div className="w-full flex-grow">
                    {chartNotRenderable ? (
                        zinniaLivePageViewsDataError ? (
                            <ErrorMessage />
                        ) : (
                            <NoDataMessage />
                        )
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
