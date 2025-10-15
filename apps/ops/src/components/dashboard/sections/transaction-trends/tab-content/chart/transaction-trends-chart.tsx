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
import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TransactionTrendsContext } from '@deps/components/dashboard/sections/transaction-trends/context/transaction-trends-context';
import { TransactionTrendsFilters } from '@deps/components/dashboard/sections/transaction-trends/tab-content/shared/transaction-trends-filters';
import { TransactionTrendsHeader } from '@deps/components/dashboard/sections/transaction-trends/tab-content/shared/transaction-trends-header';
import { generateSeries } from '@deps/components/dashboard/sections/transaction-trends/utils';
import { friendlyGroupByName } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';

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
                    <div className="basis-3/4 grow">
                        {transactionTrendsDataError ? (
                            <ErrorMessage />
                        ) : series?.length === 0 ? (
                            <NoDataMessage />
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
                    <div className={`w-1/4 pl-8 ${sharedStyles.sidebar}`}>
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
