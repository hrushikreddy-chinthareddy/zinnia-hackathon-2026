import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Highcharts from 'highcharts';
import { useContext } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
    calculateTickInterval,
    calculateTooltipRanges,
    getTooltipData,
} from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { LabelComponent } from '@deps/components/dashboard/charts/date-time-chart/label-for-chart-for-time/label';
import { DateTimeLineChart } from '@deps/components/dashboard/charts/line-charts/date-time-line-chart';
import { TransactionTrendsContext } from '@deps/components/dashboard/sections/transaction-trends/context/transaction-trends-context';
import { TransactionTrendsFilters } from '@deps/components/dashboard/sections/transaction-trends/tab-content/shared/transaction-trends-filters';
import { TransactionTrendsHeader } from '@deps/components/dashboard/sections/transaction-trends/tab-content/shared/transaction-trends-header';
import { generateSeries } from '@deps/components/dashboard/sections/transaction-trends/utils';
import { friendlyGroupByName } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import { Legend } from './legend';

dayjs.extend(relativeTime);

export const TransactionTrendsChart = () => {
    const {
        timerange,
        transactionTrendsData,
        transactionTrendsDataFetching,
        groupBy,
        transactionTrendsDataError,
    } = useContext(TransactionTrendsContext);

    const series = generateSeries(transactionTrendsData?.data, timerange);
    const tickInterval = calculateTickInterval(timerange);

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

    const xAxisLabelFormatter = (
        label: Highcharts.AxisLabelsFormatterContextObject
    ) => {
        const day = dayjs(label.value).format('MM/DD');

        return day || '';
    };

    return (
        <CardContainer>
            <TransactionTrendsHeader />

            <div className="w-3/4">
                <TransactionTrendsFilters />
            </div>

            <BlurOverlayLoader loading={transactionTrendsDataFetching}>
                <div className="flex">
                    <div className="w-3/4">
                        {transactionTrendsDataError ? (
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
                        ) : series?.length === 0 ? (
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
                            <DateTimeLineChart
                                series={series}
                                tickInterval={tickInterval}
                                tooltipFormatter={tooltipFormatter}
                                xAxisLabelFormatter={xAxisLabelFormatter}
                                yAxisTitle="case volume"
                            />
                        )}
                    </div>
                    <div className="w-1/4 pl-8">
                        {series?.length !== 0 && (
                            <Legend
                                title={friendlyGroupByName[groupBy]}
                                colors={series.map((item) => item.color)}
                                labels={series.map((item) => item.name)}
                            />
                        )}
                    </div>
                </div>
            </BlurOverlayLoader>
        </CardContainer>
    );
};
