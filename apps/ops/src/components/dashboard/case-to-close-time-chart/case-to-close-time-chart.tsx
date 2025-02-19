import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC, useMemo, useState } from 'react';

import { Carousel } from '@deps/components/carousel/carousel';
import { CaseTypeFilter } from '@deps/components/dashboard//case-type-filter';
import { ChartHeader } from '@deps/components/dashboard//chart-header';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TimeFilter } from '@deps/components/dashboard/time-filter/time-filter';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { InsightSummary } from '@deps/containers/dashboard/insight-summary/insight-summary';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { CaseTimingData } from '@deps/queries/api/cases';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardTimingQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { chunkArray } from '@deps/utils/array';

import { formatProcessFilter, generateCarouselDataLengths, startDates, TimeframeFilterOptions } from '../utils';
import styles from './case-to-close-time-chart.module.css';
import { generateLabel, generateSeries, generateTooltip, getDaysFromSeconds } from './utils';

export const CaseToCloseTimeChart: FC = () => {
    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);
    const [selectedProcess, setSelectedProcess] = useState<Processes | undefined>(Processes.NewBusiness);
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);

    const filter: DashboardSearchFilter = {
        caseStatus: [Statuses.Completed],
        createdDateStart: startDates[timeframe],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        process: formatProcessFilter(selectedProcess),
    };

    // get timing data by subprocess
    const {
        data: caseTimingData,

        isFetching: caseTimingDataFetching,
        error: caseTimingDataError,
    } = useQuery({
        queryKey: ['caseTimingChart', filter],
        queryFn: () => getCaseDashboardTimingQuery(filter, [GroupByOptions.ProcessSubType]),
        select: data => data.data?.sort((a, b) => a.secondMedian - b.secondMedian) || data,
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
    });

    // get 5 items for each slide
    const chunkedResponse: CaseTimingData[][] = chunkArray(caseTimingData || [], 5);

    // When generating the time axis, we take raw time in seconds, but we convert the seconds to hours or days and display that on the chart.
    const chartConfig = chunkedResponse.map(chunk => {
        const xAxis = chunk.map(item => item.name);
        const series = generateSeries(chunk);
        const isSeriesShowingDays = getDaysFromSeconds(series[0]?.data?.[0]?.y) >= 1;
        const baseChartConfiguration = caseChartHelpers.getBaseBarChartConfiguration();
        return {
            ...Highcharts.merge(baseChartConfiguration, {
                legend: {
                    enabled: false,
                },
                chart: {
                    height: 300,
                },
                xAxis: {
                    ...baseChartConfiguration.xAxis,
                    categories: xAxis,
                    labels: {
                        useHTML: false,
                    },
                },
                colors: ['#67A2E9'],
                plotOptions: {
                    bar: {
                        minPointLength: 10,
                    },
                },
                tooltip: {
                    formatter: function (this: Highcharts.TooltipFormatterContextObject) {
                        return generateTooltip(this);
                    },
                    useHtml: true,
                },
                yAxis: {
                    allowDecimals: false,
                    tickAmount: 5,

                    labels: {
                        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
                            return generateLabel(this, isSeriesShowingDays);
                        },
                    },
                },
                series,
            }),
        };
    });

    // Pass to the carousel to say which number of items you're currently viewing out of total
    const chunkedResponseLengths = chunkedResponse.map(chunk => chunk.length);
    const eachChunkPortionOfTotal = generateCarouselDataLengths(chunkedResponseLengths);
    const totalCaseCount = caseTimingData?.reduce((acc, val) => acc + val.count, 0);
    const content = caseTimingData ? JSON.stringify(caseTimingData) : '';

    const prompt = useMemo(
        () =>
            [
                `You are an expert in all things ${selectedProcess} case data.`,
                `Your job is to summarize the data for business and executive users.`,
                `They want simple and insightful information about the data provided to you.`,
                `The data provided to you here are completed ${dashboardChartTitleFormat(selectedProcess || '', false)} cases.`,
                `The data is grouped by ${GroupByOptions.ProcessSubType}.`,
                `The timespan the data comes from is ${timeframe}.`,
                `You are to take the median time in seconds and conver it to days`,
                `Avoid using phrases such as "the data".`,
                `Your responses should be insightful and will be displayed on a UI as a summary for a module related to a timeseries chart.`,
                `Use percentages and real data where it makes sense.`,
                `Keep it concise and to the point`,
                `Format number values to U.S. including commas where appropriate.`,
                `Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`,
            ].join(' '),
        [selectedProcess, timeframe]
    );

    const totalCases = caseTimingDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
    );

    return (
        <CardContainer fullWidth={false}>
            <ChartHeader title="Median Case Processing Times" subtitle={totalCases} />

            <BlurOverlayLoader loading={caseTimingDataFetching}>
                <div className=" flex bg-[--color-base-surface-surface-primar">
                    {caseTimingDataError ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {'Something went wrong fetching insights, please try again by refreshing the page'}
                            </Typography>
                        </div>
                    ) : (
                        <>
                            <div className={clsx('w-1/4', styles.insightsContainer)}>
                                <InsightSummary className="grow" prompt={prompt} content={content} />
                            </div>
                            <div className={clsx('w-3/4', sharedStyles.chartContainer)}>
                                <div className={sharedStyles.filterContainer}>
                                    <div className="w-1/4">
                                        <CaseTypeFilter
                                            onValueChange={setSelectedProcess}
                                            caseStatus={[Statuses.Completed]}
                                            defaultProcess={Processes.NewBusiness}
                                        />
                                    </div>
                                    <div className="w-3/4">
                                        <TimeFilter
                                            defaultValue={timeframe}
                                            onValueChange={val => setTimeframe(val as TimeframeFilterOptions)}
                                        />
                                    </div>
                                </div>
                                {caseTimingData?.length === 0 ? (
                                    <div className=" h-[19rem] flex flex-col gap-2 items-center justify-center">
                                        <>
                                            <ChartBarsIcon height={'24px'} width={'24px'} />
                                            <Typography variant={TypographyVariant.BodyBold}>
                                                There is no data for this selection
                                            </Typography>
                                        </>
                                    </div>
                                ) : (
                                    <Carousel
                                        slideStyle="my-8 pt-6"
                                        slides={chartConfig.map((chartConfig, index) => {
                                            return (
                                                <HighchartsReact
                                                    key={`submission-type-slide-${index}`}
                                                    highcharts={Highcharts}
                                                    options={chartConfig}
                                                />
                                            );
                                        })}
                                        bottomContent={
                                            <div className={styles.legend}>
                                                <p className={'typography-labels-label-sm'}>Processing time</p>
                                            </div>
                                        }
                                        slideItemsCount={eachChunkPortionOfTotal}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </BlurOverlayLoader>
        </CardContainer>
    );
};
