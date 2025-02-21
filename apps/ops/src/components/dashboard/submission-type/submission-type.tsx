import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC, useEffect, useState } from 'react';

import { Carousel } from '@deps/components/carousel/carousel';
import { CaseTypeFilter } from '@deps/components/dashboard/case-type-filter';
import { ChartHeader } from '@deps/components/dashboard/chart-header';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { getPieChartData } from '@deps/components/dashboard/distribution-charts/distribution-pie-chart-small-api-based';
import CaseStatBlock from '@deps/components/dashboard/stat-blocks/case-stat-block';
import { TimeFilter } from '@deps/components/dashboard/time-filter/time-filter';
import { FieldSize } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import PageLoader from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { chunkArray } from '@deps/utils/array';

import { Legend } from './legend';
import styles from './submission-type.module.css';
import { submissionTypeQuery, transformData, generateSeries } from './utils';
import { TimeframeFilterOptions, formatProcessFilter, generateCarouselDataLengths, startDates } from '../utils';

export const SubmissionType: FC = () => {
    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);
    const [submissionVs, setSubmissionVs] = useState<GroupByOptions>(GroupByOptions.Carrier);
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);
    const [selectedProcess, setSelectedProcess] = useState<Processes | undefined>(Processes.NewBusiness);

    const filter: DashboardSearchFilter = {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        createdDateStart: startDates[timeframe],
        process: formatProcessFilter(selectedProcess),
    };

    // If there is a selected carrier, default to the product name. Otherwise back to carrier
    useEffect(() => {
        if (selectedCarriers && Object.keys(selectedCarriers).length) {
            setSubmissionVs(GroupByOptions.ProductName);
        } else {
            setSubmissionVs(GroupByOptions.Carrier);
        }
    }, [selectedCarriers]);

    const graphGroupBy = [submissionVs, GroupByOptions.ApplicationType];

    const {
        data: pieChartStats,
        isLoading: applicationTypeLoading,
        isFetching: applicationTypeFetching,
        error: applicationTypeError,
    } = useQuery({
        queryKey: ['submissionTypePieChartStats', filter],
        queryFn: () => submissionTypeQuery(filter, [GroupByOptions.ApplicationType]),
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
        select: response => {
            const { data } = response;
            const updatedElectronicName = data?.map(item => {
                return {
                    ...item,
                    name: item.name === 'Electronic' ? 'Electronic (E-App)' : item.name,
                };
            });
            return {
                ...response,
                data: updatedElectronicName,
            };
        },
    });

    const {
        data: graphStats,
        isLoading: applicationTypeLoading2,
        isFetching: applicationTypeFetching2,
        error: applicationTypeError2,
    } = useQuery({
        queryKey: ['submissionTypeGraphStats', graphGroupBy, filter],
        queryFn: () => submissionTypeQuery(filter, graphGroupBy),
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
    });

    const chunkedResponse = chunkArray(graphStats?.data || [], 5);

    const statsWithChartData = chunkedResponse.map(chunk => {
        const transformedData = transformData(chunk);
        const series = generateSeries(transformedData);
        const applicationTypeCategories = Object.keys(transformedData);
        return {
            statsData: chunk,
            transformedData,
            series,
            applicationTypeCategories,
            chartConfig: Highcharts.merge(caseChartHelpers.getBaseBarChartConfiguration(), {
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
            }),
        };
    });

    const pieChartData = getPieChartData(pieChartStats);
    const pieChartDataColors = pieChartData.map(pieChart => {
        return {
            ...pieChart,
            color: pieChart.name === 'Digital' ? '#00628B' : pieChart.name === 'Electronic (E-App)' ? '#85BCD3' : '#021936',
            type: 'pie',
        };
    });
    const pieChartSeriesData: Highcharts.SeriesOptionsType[] = [{ data: pieChartDataColors, name: 'cases', type: 'pie' }];

    const submissionVsOptions = [
        { label: 'Carrier', value: GroupByOptions.Carrier, disabled: filter.carrier?.length === 1 },
        { label: 'Product', value: GroupByOptions.ProductName },
        { label: 'Distribution Partner', value: GroupByOptions.BrokerDealerName },
    ];

    const submissionMethodTooltip = (
        <>
            <p>
                <span className="font-bold">Digital:</span> Submitted directly through Zinnia Live's digital platform.
            </p>

            <p>
                <span className="font-bold">Electronic (E-App):</span> Submitted electronically via integrated third-party systems.
            </p>

            <p>
                <span className="font-bold">Paper:</span> Submitted in physical format and processed manually.
            </p>
        </>
    );

    const chunkedResponseLengths = chunkedResponse.map(chunk => chunk.length);

    const eachChunkPortionOfTotal = generateCarouselDataLengths(chunkedResponseLengths);

    const legendItems = [
        {
            label: 'Electronic (E-App)',
            color: '#85BCD3',
        },
        {
            label: 'Digital',
            color: '#00628B',
        },
        {
            label: 'Paper',
            color: '#021936',
        },
    ];

    const totalCaseCount = graphStats?.data?.map(stat => stat.count).reduce((a, b) => a + b, 0);

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
        applicationTypeFetching || applicationTypeFetching2 ? (
            <div className="blur">
                <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
            </div>
        ) : (
            <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
        );

    return (
        <CardContainer fullWidth={false}>
            <ChartHeader
                title="Submission Method"
                subtitle={totalCases}
                titleToolTip={submissionMethodTooltip}
                description="The distribution of incoming case requests by submission method, comparing eApp, paper, and digital submissions."
            />
            {applicationTypeLoading2 || applicationTypeLoading ? (
                <div className="grid place-content-center h-full w-full min-h-[400px]">
                    <PageLoader />
                </div>
            ) : applicationTypeError2 || applicationTypeError || !pieChartStats || !graphStats ? (
                <div className="grid place-content-center h-full w-full min-h-[400px]">
                    <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                        <ChartBarsIcon height={'24px'} width={'24px'} />
                        {'Something went wrong fetching the application types, please try again by refreshing the page'}
                    </Typography>
                </div>
            ) : (
                <BlurOverlayLoader loading={applicationTypeFetching || applicationTypeFetching2}>
                    <div className="flex bg-[--color-base-surface-surface-primary] mt-6">
                        <CaseStatBlock
                            dashboardStatsResponse={pieChartStats}
                            blockLabel="All submissions"
                            timeFrameLabel={''}
                            statMeasurementLabel="case"
                            classNames={styles.statBlock}
                            variant="single"
                            loading={applicationTypeLoading2 || applicationTypeLoading}
                            chartConfig={{
                                series: pieChartSeriesData,
                                legend: pieChartLegendConfig,
                                chart: { height: 280, marginBottom: 80 },
                            }}
                            showStatDetails={false}
                        />
                        <div className={clsx('w-3/4', sharedStyles.chartContainer)}>
                            <div className={styles.timeFilterContainer}>
                                <div className="w-1/2 flex gap-2">
                                    <Select
                                        maxContentWidth
                                        label="Group by"
                                        className={sharedStyles.selectDropdowns}
                                        options={submissionVsOptions}
                                        value={submissionVs}
                                        size={FieldSize.XS}
                                        onChange={val => setSubmissionVs(val as GroupByOptions)}
                                    />

                                    <CaseTypeFilter
                                        onValueChange={setSelectedProcess}
                                        caseStatus={[Statuses.InProgress, Statuses.Exception, Statuses.NotStarted]}
                                        defaultProcess={Processes.NewBusiness}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <TimeFilter
                                        defaultValue={timeframe}
                                        onValueChange={val => setTimeframe(val as TimeframeFilterOptions)}
                                    />
                                </div>
                            </div>

                            <Carousel
                                slideStyle="my-8 pt-6"
                                slides={statsWithChartData.map((stat, index) => {
                                    return (
                                        <HighchartsReact
                                            key={`submission-type-slide-${index}`}
                                            highcharts={Highcharts}
                                            options={stat.chartConfig}
                                        />
                                    );
                                })}
                                slideItemsCount={eachChunkPortionOfTotal}
                                bottomContent={
                                    <Legend title="Case Submissions" items={legendItems} containerClass={styles.legendContainer} />
                                }
                            />
                        </div>
                    </div>
                </BlurOverlayLoader>
            )}
        </CardContainer>
    );
};
