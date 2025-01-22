import { useQuery } from '@tanstack/react-query';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC, useEffect, useState } from 'react';

import { Carousel } from '@deps/components/carousel/carousel';
import { ChipRadio } from '@deps/components/chip-radio/chip-radio';
import { BlurOverlayLoader } from '@deps/components/overlay-loader';
import PageLoader from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { CarrierListItem } from '@deps/pages/dashboard';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { chunkArray } from '@deps/utils/array';

import styles from './submission-type.module.css';
import { submissionTypeQuery, transformData, generateSeries, startDates, TimeframeFilterOptions, getDateRangeText } from './utils';
import CaseStatBlock from '../stat-blocks/case-stat-block';

interface SubmissionTypeProps {
    selectedCarriers: CarrierListItem;
    selectedBrokerDealers: CarrierListItem;
}
export const SubmissionType: FC<SubmissionTypeProps> = ({ selectedCarriers, selectedBrokerDealers }) => {
    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);
    const [submissionVs, setSubmissionVs] = useState<GroupByOptions>(GroupByOptions.Carrier);

    const filter: DashboardSearchFilter = {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        createdDateStart: startDates[timeframe],
    };

    const carriers = Object.keys(selectedCarriers);
    if (selectedCarriers && carriers.length) {
        filter.carrier = carriers;
    }

    const brokers = Object.keys(selectedBrokerDealers);
    if (selectedBrokerDealers && brokers.length) {
        filter.brokerDealerName = brokers;
    }

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
                chart: {
                    height: 300,
                },
                xAxis: {
                    categories: applicationTypeCategories,
                },
                series,
            }),
        };
    });

    const timeframeOptions = Object.values(TimeframeFilterOptions).map(option => ({
        label: option,
        ariaLabel: option,
        value: option,
        displayText: option,
    }));

    const submissionVsOptions = [
        { label: 'Carrier', value: GroupByOptions.Carrier },
        { label: 'Product', value: GroupByOptions.ProductName },
        { label: 'DistributionPartner', value: GroupByOptions.BrokerDealerName },
    ];

    const timerangeText = getDateRangeText(timeframe);

    return (
        <div className={styles.container}>
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
                    <div className="flex bg-[--color-base-surface-surface-primary]">
                        <CaseStatBlock
                            dashboardStatsResponse={pieChartStats}
                            blockLabel="Submission method"
                            timeFrameLabel={''}
                            statMeasurementLabel="case"
                            classNames={styles.statBlock}
                            variant="single"
                            loading={applicationTypeLoading2 || applicationTypeLoading}
                            chartConfig={{ colors: ['#85BCD3', '#00628B', '#021936'] }}
                        />
                        <div className={styles.chartContainer}>
                            <div className={styles.filterContainer}>
                                <h3 className="headline-3-d">Submission Vs</h3>
                                <Select
                                    className={styles.submissionMethodSelect}
                                    options={submissionVsOptions}
                                    value={submissionVs}
                                    onChange={val => setSubmissionVs(val as GroupByOptions)}
                                />
                            </div>
                            <div className={styles.timeframeContainer}>
                                <div>
                                    <p className="typography-labels-label-lg-alt">Total case submissions</p>
                                    <p className="typography-labels-label-sm">{timerangeText}</p>
                                </div>
                                <ChipRadio
                                    id="timeframe-select"
                                    options={timeframeOptions}
                                    defaultValue={timeframe}
                                    onValueChange={val => setTimeframe(val as TimeframeFilterOptions)}
                                />
                            </div>
                            <Carousel
                                slideStyle="my-8 px-8 pt-6"
                                slides={statsWithChartData.map((stat, index) => {
                                    return (
                                        <HighchartsReact
                                            key={`submission-type-slide-${index}`}
                                            highcharts={Highcharts}
                                            options={stat.chartConfig}
                                        />
                                    );
                                })}
                            />
                        </div>
                    </div>
                </BlurOverlayLoader>
            )}
        </div>
    );
};
