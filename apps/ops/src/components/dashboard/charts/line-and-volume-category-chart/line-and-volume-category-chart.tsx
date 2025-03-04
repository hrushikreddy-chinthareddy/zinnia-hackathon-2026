import clsx from 'clsx';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useRef } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TimeframeFilterOptions } from '@deps/containers/dashboard/closed-transactions/closed-transactions';
import {
    CHART_HEIGHT,
    getBottomChartConfig,
    getTopChartConfig,
    LineAndVolumeCategoryAndSeries,
} from '@deps/helpers/dashboard/line-and-volume-category-chart.helper';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

export type LineAndVolumeCategoryChartProps = {
    chartData?: LineAndVolumeCategoryAndSeries;
    timeframe: TimeframeFilterOptions;
    showVolumeColumns?: boolean;
};

export const LineAndVolumeCategoryChart = ({
    chartData = {
        weeklyCategories: [],
        monthlyCategories: [],
        weeklyByLevel1Grouping: {},
        monthlyByLevel1Grouping: {},
        weeklySeries: {} as Highcharts.SeriesLineOptions,
        monthlySeries: {} as Highcharts.SeriesColumnOptions,
        weeklyCategoriesLabels: [],
        monthlyCategoriesLabels: [],
    },
    timeframe,
    showVolumeColumns,
}: LineAndVolumeCategoryChartProps) => {
    const topChartRef = useRef<HighchartsReact.RefObject>(null);
    const bottomChartRef = useRef<HighchartsReact.RefObject>(null);

    const sortedMonthlyArray = Object.values(chartData.monthlyByLevel1Grouping)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    const chartOptions = {
        monthlyCategories: chartData.monthlyCategories.map((value: number) => value.toString()),
        weeklyCategories: chartData.weeklyCategories,
        monthlySeries: [] as Highcharts.SeriesColumnOptions[],
        weeklySeries: [] as Highcharts.SeriesLineOptions[],
    };

    for (const carrier of sortedMonthlyArray) {
        const monthlySeries = chartData.monthlyByLevel1Grouping[carrier.name].series as Highcharts.SeriesColumnOptions;
        const weeklySeries = chartData.weeklyByLevel1Grouping[carrier.name].series as Highcharts.SeriesLineOptions;
        chartOptions.monthlySeries.push(monthlySeries);
        chartOptions.weeklySeries.push(weeklySeries);
    }

    const topChartConfig = getTopChartConfig(
        chartOptions.weeklyCategories,
        chartOptions.weeklySeries,
        chartData.weeklyCategoriesLabels,
        timeframe
    );
    const bottomChartConfig = getBottomChartConfig(
        chartOptions.monthlyCategories,
        chartOptions.monthlySeries,
        chartData.monthlyCategoriesLabels,
        timeframe
    );

    const showData = chartData.monthlyCategories.some((value: number) => value > 0);

    return (
        <div
            style={{ height: CHART_HEIGHT }}
            className={clsx(
                'flex flex-col gap-2 items-stretch justify-center text-center h-full w-full',
                !showData && 'rounded bg-gray-50 border-1 border-dashed border-gray-400'
            )}
        >
            {showData ? (
                <>
                    <HighchartsReact ref={topChartRef} highcharts={Highcharts} options={topChartConfig} />
                    {showVolumeColumns && <HighchartsReact ref={bottomChartRef} highcharts={Highcharts} options={bottomChartConfig} />}
                </>
            ) : (
                <>
                    <ChartBarsIcon title="Chart unavailable" className="mx-auto" height={'24px'} width={'24px'} />
                    <Typography variant={TypographyVariant.BodyBold}>Chart unavailable</Typography>
                </>
            )}
        </div>
    );
};
