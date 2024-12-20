import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useCallback, useEffect, useRef, useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { DashboardStatsElementResponse } from '@deps/models/case/case';
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
};

const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

const getEarliestDate = (input: DashboardStatsElementResponse[]) => {
    // Get the earliest date in the data
    let earliestDate: Date = new Date();
    input.forEach(level1Group => {
        level1Group.values?.forEach(level2Group => {
            if (level2Group.values && level2Group.values.length > 0) {
                level2Group.values?.forEach(entry => {
                    const date = new Date(entry.name);
                    if (!earliestDate || date < earliestDate) {
                        earliestDate = date;
                        return; // break the loop
                    }
                });
            } else {
                const date = new Date(level2Group.name);
                if (!earliestDate || date < earliestDate) {
                    earliestDate = date;
                    return; // break the loop
                }
            }
        });
    });

    return earliestDate;
};

export function processGroupedData(input: DashboardStatsElementResponse[]): LineAndVolumeCategoryAndSeries {
    const WEEKLY_WEEKS = 48; // 4 weeks per month for 12 months
    const MONTHLY_MONTHS = 12;
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result: LineAndVolumeCategoryAndSeries = {
        weeklyByLevel1Grouping: {},
        weeklySeries: {} as Highcharts.SeriesLineOptions,
        monthlyByLevel1Grouping: {},
        monthlySeries: {} as Highcharts.SeriesColumnOptions,
        weeklyCategories: [],
        monthlyCategories: [],
    };

    // Get the earliest date in the data
    const earliestDate: Date = getEarliestDate(input);

    // Generate categories
    const startMonthIndex = earliestDate.getUTCMonth(); // 0-based month index
    result.monthlyCategories = Array(12).fill(0);

    const months = Array.from({ length: MONTHLY_MONTHS }, (_, i) => MONTH_NAMES[(startMonthIndex + i) % 12]);
    result.weeklyCategories = months.flatMap(month => [month, month, month, month]);

    // Process data as before
    input.forEach((level1GroupedBy, i) => {
        const weeklyData: number[] = new Array(WEEKLY_WEEKS).fill(0);
        const monthlyData: number[] = new Array(MONTHLY_MONTHS).fill(0);

        const level1GroupedByName = level1GroupedBy.name;
        if (!result.weeklyByLevel1Grouping[level1GroupedByName]) {
            result.weeklyByLevel1Grouping[level1GroupedByName] = {
                series: {} as Highcharts.SeriesLineOptions,
                name: level1GroupedByName,
                total: 0,
            };
        }
        if (!result.monthlyByLevel1Grouping[level1GroupedByName]) {
            result.monthlyByLevel1Grouping[level1GroupedByName] = {
                series: {} as Highcharts.SeriesColumnOptions,
                name: level1GroupedByName,
                total: 0,
            };
        }

        result.weeklyByLevel1Grouping[level1GroupedByName].series = {
            type: 'line',
            data: weeklyData,
            name: level1GroupedByName,
            lineWidth: 2,
            marker: {
                enabled: false, // Disable markers for a clean line chart
            },
            color: colors[i % colors.length],
        };

        result.monthlyByLevel1Grouping[level1GroupedByName].series = {
            name: level1GroupedByName,
            data: monthlyData,
            stack: 'stackedBar',
            type: 'column',
            color: colors[i % colors.length],
        };

        const groupedByDate: Record<string, number> = {};

        // Flatten and aggregate counts by date
        level1GroupedBy.values?.forEach(level2GroupedBy => {
            if (level2GroupedBy.values && level2GroupedBy.values.length > 0) {
                level2GroupedBy.values?.forEach(entry => {
                    const date = entry.name; // Example: "2024-01-05"
                    groupedByDate[date] = (groupedByDate[date] || 0) + entry.count;
                });
            } else {
                const date = level2GroupedBy.name; // Example: "2024-01-05"
                groupedByDate[date] = (groupedByDate[date] || 0) + level2GroupedBy.count;
            }
        });

        // Process dates
        Object.entries(groupedByDate).forEach(([dateString, count]) => {
            const date = new Date(dateString);
            const month = (date.getUTCMonth() - startMonthIndex + 12) % 12; // Relative month index (wraps around)
            const day = date.getUTCDate();
            const weekOfMonth = Math.min(Math.ceil(day / 7), 4); // Group all 5th weeks into the 4th week. This gives us 4 weeks per month

            // Update weekly data
            const weeklyIndex = month * 4 + (weekOfMonth - 1);
            weeklyData[weeklyIndex] += count;

            // Update monthly data
            monthlyData[month] += count;
            result.monthlyByLevel1Grouping[level1GroupedByName].total += count;
        });
    });

    // Set the total for each month. this is used as the category for the stacked bar chart
    const totals: number[] = new Array(MONTHLY_MONTHS).fill(0);
    const monthlyByLevel1GroupingAsArray: ChartSeriesSummary[] = [];

    // We want to get the totals but only get the totals for the top 5 items we are showing in the line and bar chart
    for (const key in result.monthlyByLevel1Grouping) {
        monthlyByLevel1GroupingAsArray.push(result.monthlyByLevel1Grouping[key]);
    }
    const sortedAndSlicedResults = monthlyByLevel1GroupingAsArray.sort((a, b) => b.total - a.total).slice(0, 5);

    sortedAndSlicedResults.forEach(item => {
        const series = item.series.data;
        series?.forEach((value, index) => {
            totals[index] += typeof value === 'number' ? value : 0; // Accumulate the value at each index
        });
    });

    result.monthlyCategories = totals;

    return result;
}

interface LineAndVolumeCategoryChartProps {
    chartData: LineAndVolumeCategoryAndSeries | null;
}

export const LineAndVolumeCategoryChart = ({ chartData }: LineAndVolumeCategoryChartProps) => {
    if (!chartData) {
        chartData = {} as LineAndVolumeCategoryAndSeries;
    }

    const [topChartConfig, setTopChartConfig] = useState({} as Highcharts.Options);
    const [bottomChartConfig, setBottomChartConfig] = useState({} as Highcharts.Options);
    const topChartRef = useRef<HighchartsReact.RefObject>(null);
    const bottomChartRef = useRef<HighchartsReact.RefObject>(null);

    const getTopChartConfig = useCallback(
        (chartData: LineAndVolumeCategoryAndSeries, series: Highcharts.SeriesLineOptions[]): Highcharts.Options => {
            if (!chartData) return {};

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
                        endOnTick: true, // Ensures the axis extends to the last tick
                        // gridLineWidth: 1,
                        height: '100%',
                        width: '100%',
                        min: 0, // Start at the first category or value
                        // max: chartData.weeklyCategories.length, // End at the last category or value (update as needed)
                        offset: 0, // Remove extra spacing
                        tickmarkPlacement: 'between',
                        plotLines: [
                            ...Array.from({ length: chartData.weeklyCategories.length }, (_, i) => {
                                if (i === 0 || i % 4 === 0) {
                                    return {
                                        color: '#D3D3D3', // Color ticks for the edges of the month
                                        width: 1,
                                        value: i - 0.5, // Position of the gridline
                                        zIndex: 1,
                                    };
                                } else {
                                    return {
                                        color: '#FFFFFF', // Weekly ticks that are inside the month (they should look hidden)
                                        width: 1,
                                        value: i - 0.5, // Position of the gridline
                                        zIndex: 1,
                                    };
                                }
                            }).filter(Boolean),
                        ],

                        labels: {
                            step: 1,
                            formatter: function () {
                                // Only show the label starting from the 3rd tick (index 2)
                                if (this.pos < 3) {
                                    return this.pos >= 2 ? (this.value as string) : '';
                                } else if (this.pos > 3 && this.pos % 2 === 0 && this.pos % 4 !== 0) {
                                    return this.value as string;
                                } else {
                                    return '';
                                }
                            },
                            align: 'right',
                            rotation: 0, // Force labels to be horizontal
                        },
                        top: '0%',
                        categories: chartData.weeklyCategories,
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
                            text: '<b>Weekly<br/>Volume</b>',
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
                series: [...series],
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
                        if (!this.points || this.points.length === 0) return;

                        let total = 0;

                        const labelData: Array<{
                            label: string;
                            total: number;
                            color: string | Highcharts.GradientColorObject | Highcharts.PatternObject;
                        }> = this.points.map(point => {
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
                        const totalElement = document.createElement('div');
                        totalElement.style.justifySelf = 'end';
                        totalElement.style.alignSelf = 'end';
                        totalElement.style.marginTop = '4px';
                        totalElement.innerHTML = `Total: <b>${total.toLocaleString()}</b>`;
                        labelWrapper.appendChild(totalElement);
                        return labelWrapper.outerHTML;
                    },
                    useHTML: true,
                },
            };
        },
        []
    );

    const getBottomChartConfig = useCallback(
        (chartData: LineAndVolumeCategoryAndSeries, series: Highcharts.SeriesColumnOptions[]): Highcharts.Options => {
            if (!chartData) return {};

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
                    categories: chartData.monthlyCategories.map(volume => volume.toString()),
                    gridLineWidth: 1,
                    height: '100%',
                    width: '100%',
                    labels: {
                        formatter: function () {
                            return new Intl.NumberFormat().format(this.value?.toString() as unknown as number);
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
                        text: '<b>Monthly<br/>Volume</b>',
                        align: 'high', // Aligns the title to the top
                        rotation: 0, // Force title to be horizontal
                        x: -15,
                        y: 15,
                        useHTML: true, // Enables HTML in the title
                    },
                    top: '0%',
                },
                series: [...series],
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        pointWidth: 20, // Fixed width for bars
                        groupPadding: 0.1, // Reduce group spacing
                        pointPadding: 0.05, // Minimize spacing between bars in a group
                        borderWidth: 0, // Remove borders
                    },
                },
                tooltip: {
                    shared: true,
                    formatter: function () {
                        return tootTipFormatter(this.points);
                    },
                    useHTML: true,
                },
            };
        },
        []
    );

    useEffect(() => {
        const monthlyArray: ChartSeriesSummary[] = [];
        Object.entries(chartData.monthlyByLevel1Grouping).forEach(([, value]) => {
            monthlyArray.push(value);
        });

        const sortedMonthly = monthlyArray.sort((a, b) => b.total - a.total).slice(0, 5);

        const weeklySeries: Highcharts.SeriesLineOptions[] = []; // Highcharts.SeriesOptionsType
        sortedMonthly.forEach(carrier => {
            weeklySeries.push(chartData.weeklyByLevel1Grouping[carrier.name].series as Highcharts.SeriesLineOptions);
        });

        // get the series data for the top 5 carriers
        const monthlySeries: Highcharts.SeriesColumnOptions[] = sortedMonthly.map(carrier => {
            return carrier.series as Highcharts.SeriesColumnOptions;
        });

        const topChartConfig = getTopChartConfig(chartData, weeklySeries);
        const bottomChartConfig = getBottomChartConfig(chartData, monthlySeries);
        setTopChartConfig(topChartConfig);
        setBottomChartConfig(bottomChartConfig);
    }, [chartData, getBottomChartConfig, getTopChartConfig]);

    const tootTipFormatter = (points: Highcharts.TooltipFormatterContextObject[] | undefined) => {
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
        const totalElement = document.createElement('div');
        totalElement.style.justifySelf = 'end';
        totalElement.style.alignSelf = 'end';
        totalElement.style.marginTop = '4px';
        totalElement.innerHTML = `Total: <b>${total.toLocaleString()}</b>`;
        labelWrapper.appendChild(totalElement);
        return labelWrapper.outerHTML;
    };

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
