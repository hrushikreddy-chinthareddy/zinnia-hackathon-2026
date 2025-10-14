import { CompletedCaseTimeOutputLevel1 } from '@zinnia/api-types/types/analytics';
import clsx from 'clsx';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC, useContext } from 'react';

import { Carousel } from '@deps/components/carousel/carousel';
import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTimingContext } from '@deps/components/dashboard/sections/case-timing/context/case-timing-context';
import { CaseTimingFilters } from '@deps/components/dashboard/sections/case-timing/tab-content/shared/case-timing-filters';
import { CaseTimingHeader } from '@deps/components/dashboard/sections/case-timing/tab-content/shared/case-timing-header';
import {
    generateLabel,
    generateSeries,
    generateTooltip,
    getDaysFromSeconds,
} from '@deps/components/dashboard/sections/case-timing/utils';
import { generateCarouselDataLengths } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { chunkArray } from '@deps/utils/array';

import styles from './case-timing-chart.module.css';

export const CaseTimingChart: FC = () => {
    const { caseTimingData, caseTimingDataFetching, caseTimingDataError } =
        useContext(CaseTimingContext);

    // get 5 items for each slide
    const chunkedResponse: CompletedCaseTimeOutputLevel1[][] = chunkArray(
        caseTimingData || [],
        5
    );

    // When generating the time axis, we take raw time in seconds, but we convert the seconds to hours or days and display that on the chart.
    const chartConfig = chunkedResponse.map((chunk) => {
        const xAxis = chunk.map((item) => item.name);
        const series = generateSeries(chunk);
        const isSeriesShowingDays =
            getDaysFromSeconds(series[0]?.data?.[0]?.y) >= 1;
        const baseChartConfiguration =
            caseChartHelpers.getBaseBarChartConfiguration();
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
                    formatter: function (
                        this: Highcharts.TooltipFormatterContextObject
                    ) {
                        return generateTooltip(this);
                    },
                    useHtml: true,
                },
                yAxis: {
                    allowDecimals: false,
                    tickAmount: 5,

                    labels: {
                        formatter: function (
                            this: Highcharts.AxisLabelsFormatterContextObject
                        ) {
                            return generateLabel(this, isSeriesShowingDays);
                        },
                    },
                },
                series,
            }),
        };
    });

    // Pass to the carousel to say which number of items you're currently viewing out of total
    const chunkedResponseLengths = chunkedResponse.map((chunk) => chunk.length);
    const eachChunkPortionOfTotal = generateCarouselDataLengths(
        chunkedResponseLengths
    );

    return (
        <CardContainer fullWidth={false}>
            <CaseTimingHeader />
            <BlurOverlayLoader loading={caseTimingDataFetching}>
                <div className=" flex flex-col bg-[--color-base-surface-surface-primary">
                    {caseTimingDataError ? (
                        <ErrorMessage />
                    ) : (
                        <>
                            <div
                                className={clsx(
                                    sharedStyles.chartContainer,
                                    sharedStyles.noBorder
                                )}
                            >
                                <CaseTimingFilters />
                                {caseTimingData?.length === 0 ? (
                                    <NoDataMessage />
                                ) : (
                                    <Carousel
                                        slideStyle="my-8 pt-6"
                                        slides={chartConfig.map(
                                            (chartConfig, index) => {
                                                return (
                                                    <HighchartsReact
                                                        key={`submission-type-slide-${index}`}
                                                        highcharts={Highcharts}
                                                        options={chartConfig}
                                                    />
                                                );
                                            }
                                        )}
                                        bottomContent={
                                            <div className={styles.legend}>
                                                <p
                                                    className={
                                                        'typography-labels-label-sm'
                                                    }
                                                >
                                                    Processing time
                                                </p>
                                            </div>
                                        }
                                        slideItemsCount={
                                            eachChunkPortionOfTotal
                                        }
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
