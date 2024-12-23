import dayjs from 'dayjs';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useRef } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TimeframeFilterOptions } from '@deps/containers/dashboard/issued-business/issued-business';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

export type ChartSeriesSummary = {
    series: Highcharts.SeriesLineOptions | Highcharts.SeriesColumnOptions;
    name: string;
    total: number;
};

export type LineAndVolumeCategoryAndSeries = {
    weeklyByLevel1Grouping: Record<string, ChartSeriesSummary>;
    weeklySeries: Highcharts.SeriesLineOptions;
    monthlyByLevel1Grouping: Record<string, ChartSeriesSummary>;
    monthlySeries: Highcharts.SeriesColumnOptions;
    weeklyCategories: string[];
    monthlyCategories: number[];
    weeklyCategoriesLabels: {
        earliestDate: string;
        lastDate: string;
    }[];
    monthlyCategoriesLabels: {
        earliestDate: string;
        lastDate: string;
    }[];
};

export type Summary = {
    series: Highcharts.SeriesLineOptions | Highcharts.SeriesColumnOptions;
    name: string;
    total: number;
};

export type LineAndVolumeCategoryChartProps = {
    chartData: LineAndVolumeCategoryAndSeries | null;
    timeframe: TimeframeFilterOptions;
};

const getTopChartConfig = (
    weeklyCategories: string[],
    weeklySeries: Highcharts.SeriesLineOptions[],
    weeklyCategoriesLabels: {
        earliestDate: string;
        lastDate: string;
    }[],
    timeframe: TimeframeFilterOptions
): Highcharts.Options => {
    let interval = 'Weekly';
    if ([TimeframeFilterOptions.Last60Days, TimeframeFilterOptions.LastMonth].includes(timeframe)) {
        interval = 'Daily';
    }
    const plotlines = Array.from({ length: weeklyCategories.length }, (_, i) => {
        const currentDate = weeklyCategoriesLabels[i].lastDate;
        const prevDate = weeklyCategoriesLabels[i - 1]?.lastDate;
        const shouldShow = prevDate && !dayjs(currentDate).isSame(dayjs(prevDate), 'month');
        return {
            color: shouldShow ? '#D3D3D3' : '#FFFFFF', // Color ticks for the edges of the month
            width: 1,
            value: i - 0.5, // Position of the gridline
            zIndex: 1,
        };
    });

    return {
        chart: {
            height: 350,
            type: 'line', // Line chart
            spacingTop: 0, // Remove top spacing
            spacingLeft: 0,
            spacingRight: 0,
            marginLeft: 0, // Set consistent left margin. Need to be the same for both charts
            marginRight: 120, // this needs to be the same for both charts so the y-axis is aligned
        },
        legend: {
            enabled: false, // Disable the legend
        },
        credits: {
            enabled: false,
        },
        navigation: {
            buttonOptions: {
                enabled: false,
            },
        },
        title: {
            text: '', // No title
        },
        xAxis: [
            {
                // startOnTick: true,
                // endOnTick: true, // Ensures the axis extends to the last tick
                height: '100%',
                // min: 0, // Start at the first category or value
                // offset: 0, // Remove extra spacing
                tickmarkPlacement: 'on',
                plotLines: plotlines,

                labels: {
                    step: 1,
                    formatter: function () {
                        const idx = this.pos;
                        const { earliestDate } = weeklyCategoriesLabels[idx];
                        const middleOfMonth = dayjs(earliestDate).date(15);
                        if (!dayjs(earliestDate).isSame(middleOfMonth, 'day')) return '';
                        return dayjs(earliestDate).format('MMM');
                    },
                    align: 'right',
                    rotation: 0, // Force labels to be horizontal
                },
                top: '0%',
                categories: weeklyCategories,
            },
        ],
        yAxis: [
            {
                stackLabels: {
                    enabled: true,
                },
                allowDecimals: false,
                gridLineWidth: 1,
                height: '100%',
                lineWidth: 2,
                min: 0,
                offset: 0, // Remove extra spacing
                opposite: true, // Moves the x-axis to the right side
                title: {
                    text: `<b>${interval}<br/>Volume</b>`,
                    align: 'high', // Aligns the title to the top
                    rotation: 0, // Force title to be horizontal
                    x: -15,
                    y: 15,
                    useHTML: true, // Enables HTML in the title
                },
                top: 0,
                labels: {
                    y: 12,
                },
            },
        ],
        series: weeklySeries,
        plotOptions: {
            // TODO: remove
            column: {
                stacking: 'normal',
                pointWidth: 20, // Fixed width for bars
                groupPadding: 0.1, // Reduce group spacing
                pointPadding: 0.05, // Minimize spacing between bars in a group
                borderWidth: 0, // Remove borders
            },
        },
        tooltip: {
            shared: true, // Set shared to false
            formatter: function () {
                const index = this.point.index;
                const { earliestDate, lastDate } = weeklyCategoriesLabels[index];
                const date = dayjs(earliestDate);
                let dateStr = '';

                if (timeframe === TimeframeFilterOptions.LastMonth || timeframe === TimeframeFilterOptions.Last60Days) {
                    dateStr = date.format('M/D/YY');
                } else {
                    dateStr = `Week of ${date.format('M/D/YYYY')} - ${dayjs(lastDate).format('M/D/YYYY')}`;
                }
                return toolTipFormatter(this.points, dateStr);
            },
            useHTML: true,
        },
    };
};

const getBottomChartConfig = (
    monthlyCategories: string[],
    monthlySeries: Highcharts.SeriesColumnOptions[],
    monthlyCategoriesLabels: { earliestDate: string; lastDate: string }[],
    timeframe: TimeframeFilterOptions
): Highcharts.Options => {
    const interval = 'Monthly';
    const pointWidth = 20 * Math.max(Object.values(TimeframeFilterOptions).indexOf(timeframe) + 1, 1);

    return {
        chart: {
            height: 150,
            type: 'column', // Line chart
            spacingTop: 0, // Remove top spacing
            spacingLeft: 0,
            spacingRight: 0,
            marginLeft: 0, // Set consistent left margin
            marginRight: 120,
        },
        legend: {
            enabled: false, // Disable the legend
        },
        credits: {
            enabled: false,
        },
        navigation: {
            buttonOptions: {
                enabled: false,
            },
        },
        title: {
            text: '', // No title
        },
        xAxis: {
            categories: monthlyCategories,
            gridLineWidth: 1,
            height: '100%',
            labels: {
                formatter: function () {
                    const value = Number(this.value?.toString());
                    const str = new Intl.NumberFormat().format(value);
                    return str;
                },
            },
            offset: 0, // Remove extra spacing
            tickLength: 0, // Hide tick marks
            top: '0%',
        },
        yAxis: {
            allowDecimals: false,
            gridLineWidth: 1,
            height: '100%',
            lineWidth: 2,
            labels: {
                y: 12,
            },
            min: 0,
            offset: 0, // Remove extra spacing
            opposite: true, // Moves the x-axis to the right side
            title: {
                text: `<b>${interval}<br/>Volume</b>`,
                align: 'high', // Aligns the title to the top
                rotation: 0, // Force title to be horizontal
                x: -15,
                y: 15,
                useHTML: true, // Enables HTML in the title
            },
            top: '0%',
        },
        series: monthlySeries,
        plotOptions: {
            column: {
                stacking: 'normal',
                pointWidth, // Fixed width for bars
                groupPadding: 0.1, // Reduce group spacing
                pointPadding: 0.05, // Minimize spacing between bars in a group
                borderWidth: 0, // Remove borders
            },
        },
        tooltip: {
            shared: true,
            formatter: function () {
                let key = '';
                const index = this.point.index;
                const { earliestDate } = monthlyCategoriesLabels[index];
                key = dayjs(earliestDate).format('MMMM');

                return toolTipFormatter(this.points, key);
            },
            useHTML: true,
        },
    };
};

const toolTipFormatter = (points: Highcharts.TooltipFormatterContextObject[] | undefined, dateStr = dayjs().format('M/D/YYYY')) => {
    if (!points || points.length === 0) return;

    let total = 0;

    const labelData: Array<{
        label: string;
        total: number;
        color: string | Highcharts.GradientColorObject | Highcharts.PatternObject;
    }> = points.map(point => {
        total += point.y || 0;
        return {
            label: point.series.name,
            total: point.y || 0,
            color: point.color || '#000000',
        };
    });
    const labelWrapper = document.createElement('div');

    labelWrapper.style.display = 'flex';
    labelWrapper.style.flexDirection = 'column';
    labelWrapper.style.gap = '4px';
    labelWrapper.style.zIndex = '5';
    for (const value of labelData) {
        const labelElement = document.createElement('div');
        labelElement.style.display = 'flex';
        labelElement.style.alignItems = 'center';
        labelElement.style.gap = '5px';
        const colorElement = document.createElement('div');
        colorElement.style.backgroundColor = String(value.color);
        colorElement.style.width = '10px';
        colorElement.style.height = '10px';
        colorElement.style.borderRadius = '50%';
        const titleElement = document.createElement('div');
        titleElement.innerHTML = `${value.label}: <b>${value.total.toLocaleString()}</b>`;
        labelElement.appendChild(colorElement);
        labelElement.appendChild(titleElement);
        labelWrapper.appendChild(labelElement);
    }
    const dateElement = document.createElement('div');
    dateElement.style.justifySelf = 'end';
    dateElement.style.alignSelf = 'end';
    dateElement.classList.add('typography-labels-label-sm-alt');
    dateElement.innerHTML = `<i>${dateStr}</i>`;
    labelWrapper.appendChild(dateElement);
    const totalElement = document.createElement('div');
    totalElement.style.justifySelf = 'end';
    totalElement.style.alignSelf = 'end';
    totalElement.style.marginTop = '4px';
    totalElement.innerHTML = `Total: <b>${total.toLocaleString()}</b>`;
    labelWrapper.appendChild(totalElement);
    return labelWrapper.outerHTML;
};

export const LineAndVolumeCategoryChart = ({ chartData, timeframe }: LineAndVolumeCategoryChartProps) => {
    const topChartRef = useRef<HighchartsReact.RefObject>(null);
    const bottomChartRef = useRef<HighchartsReact.RefObject>(null);

    if (!chartData) {
        chartData = {
            weeklyCategories: [],
            monthlyCategories: [],
            weeklyByLevel1Grouping: {},
            monthlyByLevel1Grouping: {},
            weeklySeries: {} as Highcharts.SeriesLineOptions,
            monthlySeries: {} as Highcharts.SeriesColumnOptions,
            weeklyCategoriesLabels: [],
            monthlyCategoriesLabels: [],
        };
    }

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

    return (
        <>
            {chartData ? (
                <div>
                    <HighchartsReact ref={topChartRef} highcharts={Highcharts} options={topChartConfig} />
                    <HighchartsReact ref={bottomChartRef} highcharts={Highcharts} options={bottomChartConfig} />
                </div>
            ) : (
                <div className="flex flex-col gap-2 items-center">
                    <ChartBarsIcon height={'24px'} width={'24px'} />
                    <Typography variant={TypographyVariant.BodyBold}>Chart unavailable</Typography>
                </div>
            )}
        </>
    );
};
