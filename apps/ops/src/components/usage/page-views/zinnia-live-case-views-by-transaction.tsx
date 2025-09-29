import { useQuery } from '@tanstack/react-query';
import { UserViewsGroupByEnum } from '@xd/api-types/dist/generated-types/analytics';
import { startOfTomorrowLocalIso } from '@xd/utils/dist';
import { useTranslation } from 'react-i18next';

import { GroupedColumnsChart } from '@deps/components/dashboard/charts/bar-charts/grouped-column-chart';
import { Legend } from '@deps/components/dashboard/charts/date-time-chart/legend-for-date-time-chart/legend';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getUserViewsCountsQuery } from '@deps/queries/tanstack/usage/usageQueries';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import {
    startDates,
    TimeframeFilterOptions,
    toProcessRoleRows,
    top5ProcessesByVisibleRoles,
    toGroupedBarSeriesFromRows,
    PrepareTop5CaseViewsCSV,
    categoryValueTooltip,
} from './utils';
import { TotalCount } from '../total-count';
import UsageHeaderLayout from '../usage-common-header';
import { colors, generateCSVFileName, ApiRoles } from '../utils';

export const ZinniaLiveCaseViewsByTransaction = ({
    title,
}: {
    title: string;
}) => {
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
        dateEnd: startOfTomorrowLocalIso(timerange.to),
        userRole: [
            ApiRoles.Agent,
            ApiRoles.ZinniaCallCenter,
            ApiRoles.ZinniaOperations,
        ],
    };

    const {
        data: zinniaLiveCaseViewsByTransactionData,
        isFetching: zinniaLiveCaseViewsByTransactionDataFetching,
        isError: zinniaLiveCaseViewsByTransactionDataError,
    } = useQuery({
        queryKey: ['zinniaLiveCaseViewsByTransactionData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getUserViewsCountsQuery(filter, [
                UserViewsGroupByEnum.PROCESS,
                UserViewsGroupByEnum.USER_ROLE,
            ]),
    });
    const rows = toProcessRoleRows(
        zinniaLiveCaseViewsByTransactionData?.data || []
    );
    const categories = top5ProcessesByVisibleRoles(rows);

    const series = toGroupedBarSeriesFromRows(rows, categories, colors);

    const chartNotRenderable =
        zinniaLiveCaseViewsByTransactionDataError || !series?.length;

    const { t } = useTranslation();

    return (
        <div className="flex w-1/2 flex-col gap-4 px-8 py-8 rounded bg-white border border-gray-200 min-h">
            <UsageHeaderLayout
                title={title}
                description={String(
                    t('usage.pageViews.zinniaLiveCaseViews.description') ?? ''
                )}
                data={zinniaLiveCaseViewsByTransactionData?.data || []}
                csvFileName={generateCSVFileName(
                    'usage.pageViews.zinniaLiveCaseViews.title',
                    timerange
                )}
                csvFunction={PrepareTop5CaseViewsCSV}
            />
            <div className="flex items-center justify-between gap-4 w-full">
                <div className="mb-4 md:mb-0 md:w-1/3"></div>
                <div className="flex items-center gap-4">
                    <TotalCount
                        isDataFetching={
                            zinniaLiveCaseViewsByTransactionDataFetching
                        }
                        data={
                            zinniaLiveCaseViewsByTransactionData ?? {
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

            <BlurOverlayLoader
                loading={zinniaLiveCaseViewsByTransactionDataFetching}
            >
                <div className="w-full flex-grow">
                    {chartNotRenderable ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography
                                variant={TypographyVariant.BodyBold}
                                className="mt-4 flex flex-row gap-2"
                            >
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {chartNotRenderable
                                    ? 'Something went wrong fetching the zinnia live unique logins, please try again by refreshing the page'
                                    : 'There is no data for this selection'}
                            </Typography>
                        </div>
                    ) : (
                        <GroupedColumnsChart
                            categories={categories}
                            series={series} // [{ name, data, color }]
                            xAxisTitle="Case type"
                            yAxisTitle="Page views"
                            height={495}
                            pointWidth={8}
                            tooltipFormatter={categoryValueTooltip}
                        />
                    )}
                </div>
                <div className="w-full pl-2">
                    {series?.length !== 0 && (
                        <Legend
                            title={''} // no title needed
                            colors={series.map((item) => item.color)}
                            labels={series.map((item) => item.name)}
                        />
                    )}
                </div>
            </BlurOverlayLoader>
        </div>
    );
};
