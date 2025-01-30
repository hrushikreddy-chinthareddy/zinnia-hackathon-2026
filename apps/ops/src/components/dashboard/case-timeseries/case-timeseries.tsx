import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import {
    Icon,
    IconType,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableStickyColumn,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useMemo, useState } from 'react';

import { LineAndVolumeCategoryChart } from '@deps/components/dashboard/line-and-volume-category-chart/line-and-volume-category-chart';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { InsightSummary } from '@deps/containers/dashboard/insight-summary/insight-summary';
import { TimeframeFilterOptions } from '@deps/containers/dashboard/issued-business/issued-business';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { processGroupedData } from '@deps/helpers/dashboard/line-and-volume-category-chart.helper';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { toTitleCase } from '@deps/helpers/string.helper';
import { Processes } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getStatsData } from '@deps/queries/tanstack/dashboard/dashboardQueries';

const CHART_HEIGHT = 500;

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
}

type Summary = {
    series: Highcharts.SeriesLineOptions | Highcharts.SeriesColumnOptions;
    name: string;
    total: number;
};

const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

interface Props {
    selectedSubprocess: string;
    legendLabel: string;
    title: string;
    filters: DashboardSearchFilter;
    groupByOptions: GroupByOptions[];
    selectedProcess: Processes;
    linkQueryFormat: string;
    timeframe: TimeframeFilterOptions;
    sortable?: boolean;
    showSubtitle?: boolean;
}

type SortType = 'total' | 'name' | 'avg';
type SortDirection = 'asc' | 'desc';
type SortFns = Record<SortDirection, (a: Summary, b: Summary) => number>;

const sortFns: Record<SortType, SortFns> = {
    total: {
        asc: (a, b) => a.total - b.total,
        desc: (a, b) => b.total - a.total,
    },
    // highest total must have highest avg
    // so we can use the same function
    avg: {
        asc: (a, b) => a.total - b.total,
        desc: (a, b) => b.total - a.total,
    },
    name: {
        asc: (a, b) => a.name.localeCompare(b.name),
        desc: (a, b) => b.name.localeCompare(a.name),
    },
};

export const CaseTimeseries = ({
    selectedSubprocess = 'NB_REG60',
    legendLabel,
    title,
    filters,
    groupByOptions,
    selectedProcess,
    linkQueryFormat,
    timeframe,
    sortable = false,
    showSubtitle = true,
}: Props) => {
    const { data: caseTimeseriesData, isFetching: caseTimeSeriesDataFetching } = useQuery({
        queryKey: ['caseTimeseriesData', filters, groupByOptions],
        placeholderData: previousData => previousData,
        queryFn: async () => {
            const data = await getStatsData(filters, groupByOptions);
            if (!data?.data?.statsResponseData) {
                throw data;
            }
            const statsResponseData = data?.data?.statsResponseData;
            return statsResponseData;
        },
    });

    const [sortOrder, setSortOrder] = useState<[SortType, SortDirection]>(['total', 'desc']);

    const { processedData, monthlyArray } = useMemo(() => {
        let processedData;
        let monthlyArray: Summary[] = [];
        if (caseTimeseriesData) {
            processedData = processGroupedData(caseTimeseriesData, timeframe);
            monthlyArray = [...Object.values(processedData.monthlyByLevel1Grouping)];
        }
        return {
            processedData,
            monthlyArray,
        };
    }, [caseTimeseriesData, timeframe]);

    const sortedMonthlyArray = useMemo(() => {
        if (!sortable) return monthlyArray;
        const [sortType, sortDirection] = sortOrder;
        const sortFn = sortFns[sortType][sortDirection];
        return monthlyArray.sort(sortFn);
    }, [monthlyArray, sortOrder, sortable]);

    const content = monthlyArray.length > 0 ? JSON.stringify(monthlyArray) : '';

    const prompt = useMemo(
        () =>
            [
                `You are an expert in all things ${selectedProcess} case data.`,
                `Your job is to summarize the data for business and executive users.`,
                `They want simple and insightful information about the data provided to you.`,
                `The data provided to you here are completed ${dashboardChartTitleFormat(selectedSubprocess, false)} cases.`,
                `The data is grouped by ${groupByOptions.join(', ')}.`,
                `Avoid using phrases such as "the data".`,
                `Your responses should be insightful and will be displayed on a UI as a summary for a module related to a timeseries chart.`,
                `Use percentages and real data where it makes sense.`,
                `Keep it concise and to the point`,
                `Format number values to U.S. including commas where appropriate.`,
                `Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`,
            ].join(' '),
        [selectedSubprocess, groupByOptions, selectedProcess]
    );

    const handleSort = (sortType: SortType) => {
        const [currentSortType, currentSortDirection] = sortOrder;

        // if current sort type is same as sort type, toggle sort direction
        if (currentSortType === sortType) {
            setSortOrder([sortType, currentSortDirection === 'asc' ? 'desc' : 'asc']);

            // if current sort type is different from sort type, set new sort type to asc
        } else {
            setSortOrder([sortType, 'asc']);
        }
    };

    const tableHeaders: Record<SortType, string> = {
        name: legendLabel,
        avg: 'Monthly Avg',
        total: 'Total Cases',
    };

    const StatsTable = (
        <Table stickyColumn={TableStickyColumn.End}>
            <TableHeader>
                <TableRow>
                    {Object.entries(tableHeaders).map(([key, value], index) => {
                        const iconType =
                            sortOrder[0] === key ? (sortOrder[1] === 'asc' ? IconType.ARROW_UP : IconType.ARROW_DOWN) : IconType.SORT;
                        return (
                            <TableHeaderCell
                                className={clsx('typography-content-body-sm-bold', index !== 0 && '!text-right')}
                                key={key}
                                sortable={sortable}
                                onClick={() => handleSort(key as SortType)}
                            >
                                <span className="inline-flex items-center align-middle gap-1">
                                    {value}
                                    {sortable && <Icon color="var(--color-secondary)" type={iconType} height={16} width={16} />}
                                </span>
                            </TableHeaderCell>
                        );
                    })}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, index) => {
                    const divisors: Record<TimeframeFilterOptions, number> = {
                        [TimeframeFilterOptions.Trailing12Months]: 12,
                        [TimeframeFilterOptions.Last6Months]: 6,
                        [TimeframeFilterOptions.Last90Days]: 3,
                        [TimeframeFilterOptions.Last60Days]: 2,
                        [TimeframeFilterOptions.LastMonth]: 1,
                    };

                    const stat = sortedMonthlyArray[index];
                    const NoDataComponent = caseTimeSeriesDataFetching ? Skeleton : 'div';
                    const NoDataCell = (
                        <NoDataComponent className={clsx('grow h-[22px] w-full rounded', caseTimeSeriesDataFetching && 'bg-gray-50')} />
                    );

                    if (!stat) {
                        return null;
                    }

                    return (
                        <TableRow key={`stat-${index}-${stat?.name || ''}`}>
                            <TableCell className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: colors[index] }}></div>
                                {stat?.name ? (
                                    <NavElement
                                        href={linkQueryFormat.replace(/replaceme/g, encodeURIComponent(stat.name))}
                                        size={NavElementSize.Small}
                                        type={NavElementType.Link}
                                        className="capitalize whitespace-nowrap overflow-hidden text-ellipsis typography-content-body-sm-bold"
                                        target="_blank"
                                        title={toTitleCase(stat.name)}
                                    >
                                        {stat.name}
                                    </NavElement>
                                ) : (
                                    NoDataCell
                                )}
                            </TableCell>
                            <TableCell className={`typography-content-body-sm text-right`}>
                                {stat?.total
                                    ? wholeNumberFormatify(stat.total / divisors[timeframe || TimeframeFilterOptions.Trailing12Months])
                                    : NoDataCell}
                            </TableCell>
                            <TableCell className={`typography-content-body-sm text-right`}>
                                {stat?.total ? wholeNumberFormatify(stat.total) : NoDataCell}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

    return (
        <CardContainer containerClassNames="rounded" classNames="!p-0 flex flex-col gap-8" fullWidth={true}>
            <BlurOverlayLoader loading={caseTimeSeriesDataFetching}>
                <div className="grow flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-6">
                    <div className="flex flex-col gap-8 lg:w-1/4">
                        <div id="case-timeseries-title" className="flex flex-col gap-2">
                            <Typography variant={TypographyVariant.H3}>{title}</Typography>
                            {showSubtitle && (
                                <Typography variant={TypographyVariant.LabelLg}>
                                    {dashboardChartTitleFormat(selectedSubprocess, false)}
                                </Typography>
                            )}
                        </div>
                        <InsightSummary className="grow" prompt={prompt} content={content} />
                    </div>
                    <div className="grow py-1">{StatsTable}</div>
                </div>
                <div className="grow flex flex-col gap-2">
                    <Typography variant={TypographyVariant.BodyBold}>{dashboardChartTitleFormat(timeframe, false)}</Typography>

                    <LineAndVolumeCategoryChart timeframe={timeframe} chartData={processedData} />
                </div>
            </BlurOverlayLoader>
        </CardContainer>
    );
};
