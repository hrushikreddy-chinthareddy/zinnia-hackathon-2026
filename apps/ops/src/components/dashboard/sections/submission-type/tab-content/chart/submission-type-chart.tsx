import clsx from 'clsx';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC, useContext } from 'react';

import { Carousel } from '@deps/components/carousel/carousel';
import { getPieChartData } from '@deps/components/dashboard/charts/distribution-charts/distribution-pie-chart-small-api-based';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { Legend } from '@deps/components/dashboard/legend/legend';
import { SubmissionTypeContext } from '@deps/components/dashboard/sections/submission-type/context/submission-type-context';
import { SubmissionMethodTooltip } from '@deps/components/dashboard/sections/submission-type/submission-type';
import { SubmissionTypeFilters } from '@deps/components/dashboard/sections/submission-type/tab-content/shared/submission-type-filters';
import {
    transformData,
    generateSeries,
} from '@deps/components/dashboard/sections/submission-type/utils';
import CaseStatBlock from '@deps/components/dashboard/stat-blocks/case-stat-block';
import { generateCarouselDataLengths } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { chunkArray } from '@deps/utils/array';

import styles from './submission-type-chart.module.css';

export const SubmissionTypeChart: FC = () => {
    const {
        graphStats,
        pieChartStats,
        graphStatsLoading,
        graphStatsFetching,
        pieChartStatsLoading,
        pieChartStatsFetching,
        pieChartStatsError,
        graphStatsError,
    } = useContext(SubmissionTypeContext);

    const chunkedResponse = chunkArray(graphStats?.data || [], 5);

    const statsWithChartData = chunkedResponse.map((chunk) => {
        const transformedData = transformData(chunk);
        const series = generateSeries(transformedData);
        const applicationTypeCategories = Object.keys(transformedData);
        return {
            statsData: chunk,
            transformedData,
            series,
            applicationTypeCategories,
            chartConfig: Highcharts.merge(
                caseChartHelpers.getBaseBarChartConfiguration(),
                {
                    legend: {
                        enabled: false,
                    },
                    chart: {
                        height: 300,
                    },
                    xAxis: {
                        categories: applicationTypeCategories,
                        labels: {
                            useHTML: false,
                        },
                    },
                    yAxis: {
                        allowDecimals: false,
                    },

                    series,
                }
            ),
        };
    });

    const pieChartData = getPieChartData(pieChartStats);
    const pieChartDataColors = pieChartData.map((pieChart) => {
        return {
            ...pieChart,
            color:
                pieChart.name === 'Digital'
                    ? '#00628B'
                    : pieChart.name === 'Electronic (E-App)'
                    ? '#85BCD3'
                    : '#021936',
            type: 'pie',
        };
    });
    const pieChartSeriesData: Highcharts.SeriesOptionsType[] = [
        { data: pieChartDataColors, name: 'cases', type: 'pie' },
    ];

    const chunkedResponseLengths = chunkedResponse.map((chunk) => chunk.length);

    const eachChunkPortionOfTotal = generateCarouselDataLengths(
        chunkedResponseLengths
    );

    const legendItems = [
        {
            label: 'Electronic (E-App)',
            color: '#85BCD3',
        },
        {
            label: 'Paper',
            color: '#021936',
        },
    ];

    const totalCaseCount = graphStats?.data
        ?.map((stat) => stat.count)
        .reduce((a, b) => a + b, 0);

    //TODO: When we re-write the pie charts, probably move this into its own component.
    const pieChartLegendConfig: Highcharts.LegendOptions = {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        width: 180,
        padding: 10,
        navigation: {
            enabled: true,
        },
        enabled: true,
        maxHeight: 120,
        itemStyle: {
            fontSize: '12px',
        },
    };

    const totalCases =
        pieChartStatsFetching || graphStatsFetching ? (
            <div className="blur">
                <p className={'typography-titles-subtitle'}>
                    {totalCaseCount?.toLocaleString() || '0'} total cases
                </p>
            </div>
        ) : (
            <p className={'typography-titles-subtitle'}>
                {totalCaseCount?.toLocaleString() || '0'} total cases
            </p>
        );

    return (
        <CardContainer fullWidth={false}>
            <ChartHeader
                title="Submission Method"
                subtitle={totalCases}
                titleToolTip={SubmissionMethodTooltip}
                description="The distribution of incoming case requests by submission method, comparing Electronic (E-App) and Paper submissions."
            />

            <BlurOverlayLoader
                loading={pieChartStatsFetching || graphStatsFetching}
            >
                <div className="flex bg-[--color-base-surface-surface-primary] mt-6">
                    <CaseStatBlock
                        dashboardStatsResponse={pieChartStats}
                        blockLabel="All submissions"
                        timeFrameLabel={''}
                        statMeasurementLabel="case"
                        classNames={styles.statBlock}
                        variant="single"
                        loading={graphStatsLoading || pieChartStatsLoading}
                        chartConfig={{
                            series: pieChartSeriesData,
                            legend: pieChartLegendConfig,
                            chart: { height: 280, marginBottom: 80 },
                        }}
                        showStatDetails={false}
                        showInsights={false}
                    />
                    <div className={clsx('w-3/4', sharedStyles.chartContainer)}>
                        <SubmissionTypeFilters />
                        {graphStatsLoading || pieChartStatsLoading ? (
                            <div className="grid place-content-center h-full w-full min-h-[400px]">
                                <PageLoader />
                            </div>
                        ) : graphStatsError || pieChartStatsError ? (
                            <div className="grid place-content-center h-full w-full min-h-[400px]">
                                <Typography
                                    variant={TypographyVariant.BodyBold}
                                    className="mt-4 flex flex-row gap-2"
                                >
                                    <ChartBarsIcon
                                        height={'24px'}
                                        width={'24px'}
                                    />
                                    {
                                        'Something went wrong fetching the application types, please try again by refreshing the page'
                                    }
                                </Typography>
                            </div>
                        ) : pieChartStats?.data?.length === 0 ||
                          graphStats?.data?.length === 0 ? (
                            <div className="grid place-content-center h-full w-full min-h-[400px]">
                                <Typography
                                    variant={TypographyVariant.BodyBold}
                                    className="mt-4 flex flex-row gap-2"
                                >
                                    <ChartBarsIcon
                                        height={'24px'}
                                        width={'24px'}
                                    />
                                    {'There is no data for this selection'}
                                </Typography>
                            </div>
                        ) : (
                            <Carousel
                                slideStyle="my-8 pt-6"
                                slides={statsWithChartData.map(
                                    (stat, index) => {
                                        return (
                                            <HighchartsReact
                                                key={`submission-type-slide-${index}`}
                                                highcharts={Highcharts}
                                                options={stat.chartConfig}
                                            />
                                        );
                                    }
                                )}
                                slideItemsCount={eachChunkPortionOfTotal}
                                bottomContent={
                                    <Legend
                                        title="Case Submissions"
                                        items={legendItems}
                                        containerClass={styles.legendContainer}
                                    />
                                }
                            />
                        )}
                    </div>
                </div>
            </BlurOverlayLoader>
        </CardContainer>
    );
};
