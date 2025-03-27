import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Highcharts from 'highcharts';
import { useContext } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { DateTimeLineChart } from '@deps/components/dashboard/charts/line-charts/date-time-line-chart';
import { friendlyGroupByName } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import { LabelComponent } from './label';
import { Legend } from './legend';
import { TransactionTrendsContext } from '../../context/transaction-trends-context';
import { calculateTickInterval, calculateTooltipRanges, generateSeries, getTooltipData } from '../../utils';
import { TransactionTrendsFilters } from '../shared/transaction-trends-filters';
import { TransactionTrendsHeader } from '../shared/transaction-trends-header';

dayjs.extend(relativeTime);

export const TransactionTrendsChart = () => {
    const { timeframe, transactionTrendsData, transactionTrendsDataFetching, groupBy, transactionTrendsDataError } =
        useContext(TransactionTrendsContext);
    const series = generateSeries(transactionTrendsData?.data, timeframe);
    const tickInterval = calculateTickInterval(timeframe);

    const tooltipFormatter: Highcharts.TooltipFormatterCallbackFunction = function (this) {
        const points = this.points;
        const dateStr = calculateTooltipRanges(this, timeframe);
        const tooltipData = getTooltipData(points) || '';

        return renderToStaticMarkup(<LabelComponent labelData={tooltipData.labelData} dateStr={dateStr} total={tooltipData.total ?? 0} />);
    };

    const xAxisLabelFormatter = (label: Highcharts.AxisLabelsFormatterContextObject) => {
        const day = dayjs(label.value).format('MM/DD');

        return day || '';
    };

    return (
        <CardContainer>
            <TransactionTrendsHeader chartView />

            <div className="w-3/4">
                <TransactionTrendsFilters />
            </div>

            <BlurOverlayLoader loading={transactionTrendsDataFetching}>
                <div className="flex">
                    <div className="w-3/4">
                        {transactionTrendsDataError ? (
                            <div className="grid place-content-center h-full w-full min-h-[400px]">
                                <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                    <ChartBarsIcon height={'24px'} width={'24px'} />
                                    {'Something went wrong fetching the application types, please try again by refreshing the page'}
                                </Typography>
                            </div>
                        ) : series?.length === 0 ? (
                            <div className="grid place-content-center h-full w-full min-h-[400px]">
                                <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                    <ChartBarsIcon height={'24px'} width={'24px'} />
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
                                colors={series.map(item => item.color)}
                                labels={series.map(item => item.name)}
                            />
                        )}
                    </div>
                </div>
            </BlurOverlayLoader>
        </CardContainer>
    );
};
