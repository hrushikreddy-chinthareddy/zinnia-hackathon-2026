import clsx from 'clsx';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import { useCallback, useEffect, useRef, useState } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat, splitAndSentenceCase } from '@deps/helpers/dashboard/dashboard-helpers';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { DashboardStatsElementResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';

import useExceptionData from '../../pages/dashboard/issued-business/useExceptionData';
import NavElement, { NavElementSize, NavElementType } from '../nav-element/nav-element';
import styles from './top-5-subprocesses-by-volume/top-5-subprocess-by-volume.module.css';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
}

type summary = {
    series: Highcharts.SeriesLineOptions | Highcharts.SeriesColumnOptions;
    name: string;
    total: number;
};

type Output = {
    weekly: Record<string, summary>;
    monthly: Record<string, summary>;
    weeklyCategories: string[];
    monthlyCategories: number[];
};

const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

function processCarrierData(input: DashboardStatsElementResponse[]): Output {
    const WEEKLY_WEEKS = 48; // 4 weeks per month for 12 months
    const MONTHLY_MONTHS = 12;
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result: Output = {
        weekly: {},
        monthly: {},
        weeklyCategories: [],
        monthlyCategories: [],
    };

    // Get the earliest date in the data
    let earliestDate: Date = new Date();
    input.forEach(carrier => {
        carrier.values?.forEach(exceptionCategory => {
            exceptionCategory.values?.forEach(entry => {
                const date = new Date(entry.name);
                if (!earliestDate || date < earliestDate) {
                    earliestDate = date;
                    return; // break the loop
                }
            });
        });
    });

    // Use the earliest date to calculate the starting point for categories
    if (!earliestDate) {
        throw new Error('No valid dates found in input data');
    }

    // Generate categories
    const startMonthIndex = earliestDate.getUTCMonth(); // 0-based month index
    result.monthlyCategories = Array(12).fill(0); // Array.from({ length: MONTHLY_MONTHS }, (_, i) => MONTH_NAMES[(startMonthIndex + i) % 12]);

    const months = Array.from({ length: MONTHLY_MONTHS }, (_, i) => MONTH_NAMES[(startMonthIndex + i) % 12]);
    result.weeklyCategories = months.flatMap(month => [month, month, month, month]);

    // Process data as before
    input.forEach((carrier, i) => {
        const weeklyData: number[] = new Array(WEEKLY_WEEKS).fill(0);
        const monthlyData: number[] = new Array(MONTHLY_MONTHS).fill(0);

        const carrierName = carrier.name;
        if (!result.weekly[carrierName]) {
            result.weekly[carrierName] = {
                series: {} as Highcharts.SeriesLineOptions,
                name: carrierName,
                total: 0,
            };
        }
        if (!result.monthly[carrierName]) {
            result.monthly[carrierName] = {
                series: {} as Highcharts.SeriesColumnOptions,
                name: carrierName,
                total: 0,
            };
        }

        result.weekly[carrierName].series = {
            type: 'line',
            data: weeklyData,
            name: carrierName,
            lineWidth: 2,
            marker: {
                enabled: false, // Disable markers for a clean line chart
            },
            color: colors[i % colors.length],
            xAxis: 0, // Use the first xAxis
            yAxis: 0,
        };

        result.monthly[carrierName].series = {
            name: carrierName,
            data: monthlyData,
            stack: 'stackedBar',
            type: 'column',
            color: colors[i % colors.length],
            xAxis: 1, // Use the second xAxis
            yAxis: 1,
        };

        const groupedByDate: Record<string, number> = {};

        // Flatten and aggregate counts by date
        carrier.values?.forEach(exceptionCategory => {
            exceptionCategory.values?.forEach(entry => {
                const date = entry.name; // Example: "2024-01-05"
                groupedByDate[date] = (groupedByDate[date] || 0) + entry.count;
            });
        });

        // Process dates
        Object.entries(groupedByDate).forEach(([dateString, count]) => {
            const date = new Date(dateString);
            const month = (date.getUTCMonth() - startMonthIndex + 12) % 12; // Relative month index (wraps around)
            const day = date.getUTCDate();
            const weekOfMonth = Math.min(Math.ceil(day / 7), 4); // Group all 5th weeks into the 4th week

            // Update weekly data
            const weeklyIndex = month * 4 + (weekOfMonth - 1);
            weeklyData[weeklyIndex] += count;

            // Update monthly data
            monthlyData[month] += count;
            result.monthly[carrierName].total += count;
        });
    });

    // Set the total for each month. this is used as the category for the stacked bar chart
    const totals: number[] = new Array(MONTHLY_MONTHS).fill(0);

    for (const key in result.monthly) {
        if (result.monthly.hasOwnProperty(key)) {
            const series = result.monthly[key].series.data;
            series?.forEach((value, index) => {
                totals[index] += typeof value === 'number' ? value : 0; // Accumulate the value at each index
            });
        }
    }

    result.monthlyCategories = totals;

    return result;
}

export const ExceptionSummary = ({
    startDate,
    carrierOrBrokerDealer = GroupByOptions.Carrier,
    selectedSubprocess = 'NB_REG60',
}: {
    startDate: string;
    carrierOrBrokerDealer?: GroupByOptions.Carrier | GroupByOptions.BrokerDealerName;
    selectedSubprocess: string;
}) => {
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const shouldShowCaseInsights = useCaseInsightsPermission();
    const [loading, exceptionData, statsResponse, filter] = useExceptionData({
        startDate,
        carrierOrBrokerDealer,
        processSubType: selectedSubprocess,
    });

    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const [sortedMonthly, setSortedMonthly] = useState([] as summary[]);
    const [chartConfig, setChartConfig] = useState({} as Highcharts.Options);
    const groupBy: GroupByOptions = GroupByOptions.Carrier;

    const getChartConfig = useCallback(
        (processedData: Output, sortedMonthly: summary[]): Highcharts.Options => {
            if (!statsResponse) return {};

            // get the weekly data for the top 5 carriers based on total
            const weekly: Highcharts.SeriesOptionsType[] = [];
            sortedMonthly.forEach(carrier => {
                weekly.push(processedData.weekly[carrier.name].series as Highcharts.SeriesOptionsType);
            });

            // get the series data for the top 5 carriers
            const monthly = sortedMonthly.map(carrier => {
                return carrier.series;
            });

            return {
                chart: {
                    height: 600,
                    type: 'line', // Line chart
                    // plotBorderWidth: 1, // Add a border around the plot area
                    // plotBorderColor: '#D3D3D3', // Set the border color
                    spacingTop: 0, // Remove top spacing
                    spacingLeft: 0,
                    spacingRight: 0,
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
                        height: '60%',
                        min: 0, // Start at the first category or value
                        // max: processedData.weeklyCategories.length, // End at the last category or value (update as needed)
                        offset: 0, // Remove extra spacing
                        tickmarkPlacement: 'between',
                        plotLines: [
                            ...Array.from({ length: processedData.weeklyCategories.length }, (_, i) => {
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
                        categories: processedData.weeklyCategories,
                    },
                    {
                        categories: processedData.monthlyCategories.map(volume => volume.toString()),
                        gridLineWidth: 1,
                        height: '30%',
                        offset: 0, // Remove extra spacing
                        // linkedTo: 0, // Link categories with the first axis
                        tickLength: 0, // Hide tick marks
                        top: '68%',
                    },
                ],
                yAxis: [
                    {
                        allowDecimals: false,
                        gridLineWidth: 1,
                        height: '60%',
                        lineWidth: 2,
                        min: 0,
                        offset: 0, // Remove extra spacing
                        opposite: true, // Moves the x-axis to the right side
                        title: {
                            text: '<b>Weekly<br/>Exceptions</b>',
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
                    {
                        allowDecimals: false,
                        gridLineWidth: 1,
                        height: '30%',
                        lineWidth: 2,
                        min: 0,
                        offset: 0, // Remove extra spacing
                        opposite: true, // Moves the x-axis to the right side
                        title: {
                            text: '<b>Monthly<br/>Volume</b>',
                            align: 'low', // Aligns the title to the top
                            rotation: 0, // Force title to be horizontal
                            x: 30,
                            y: -15,
                            useHTML: true, // Enables HTML in the title
                        },
                        top: '68%',
                    },
                ],
                series: [...(weekly as Highcharts.SeriesOptionsType[]), ...(monthly as Highcharts.SeriesOptionsType[])],
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        pointWidth: 20, // Fixed width for bars
                        groupPadding: 0.1, // Reduce group spacing
                        pointPadding: 0.05, // Minimize spacing between bars in a group
                        borderWidth: 0, // Remove borders
                        // dataLabels: {
                        //     enabled: true,
                        //     inside: true,
                        //     format: '{y}',
                        //     style: {
                        //         color: '#FFFFFF',
                        //     },
                        // },
                    },
                },
                tooltip: {
                    formatter: function () {
                        const xAxis = this.series.xAxis;

                        // Find the index of the xAxis in the chart's xAxis array
                        const xAxisIndex = this.series.chart.xAxis.indexOf(xAxis);

                        // Apply custom formatting based on xAxis index
                        // this is the lower chart
                        if (xAxisIndex === 1) {
                            const formattedValue = new Intl.NumberFormat().format(this.y || 0);
                            const pointIndex = this.point.index;
                            // find the category label from the first xAxis and display it in the tooltip
                            return `<div>${this.series.chart.xAxis[0].categories[pointIndex * 4]}<br/><b>${
                                this.series.name
                            }</b>: ${formattedValue}</div>`;
                        } else {
                            const formattedValue = new Intl.NumberFormat().format(this.y || 0);
                            return `<div>${this.key}<br/><b>${this.series.name}</b>: ${formattedValue}`;
                        }
                    },
                },
            };
        },
        [statsResponse]
    );

    useEffect(() => {
        const processedData = processCarrierData(statsResponse || []);

        // sort and slice to find the top 5 months
        const monthlyArray: summary[] = [];
        Object.entries(processedData.monthly).forEach(([, value]) => {
            monthlyArray.push(value);
        });

        const sortedMonthly = monthlyArray.sort((a, b) => b.total - a.total).slice(0, 5);
        const myChartConfig = getChartConfig(processedData, sortedMonthly);
        setChartConfig(myChartConfig);
        setSortedMonthly(sortedMonthly);
    }, [statsResponse, getChartConfig]);

    const getOpenAiSummary = async (caseStats: DashboardStatsElementResponse[], processSubType: string) => {
        try {
            const summary = await getCaseInsights({
                content: JSON.stringify(caseStats),
                prompt: `You are an expert in all things new business application data. Your job is to summarize the data for business and executive users. They want simple and insightful information about the data provided to you. The data provided to you here are completed ${dashboardChartTitleFormat(
                    processSubType,
                    false
                )} applications, but the ${dashboardChartTitleFormat(
                    processSubType,
                    false
                )} applications encountered exceptions along their path to completion. The data is grouped by Carrier and then by Exception Category and the values represent an exception that occurred for a ${dashboardChartTitleFormat(
                    processSubType,
                    false
                )} application. Avoid using phrases such as "the data". Your responses should be insightful and will be displayed on a UI as a summary for a module related to a distribution chart. Use percentages and real data where it makes sense. Keep it concise and to the point. Format number values to U.S. inclding commas where appropriate.`,
            });
            return summary;
        } catch (error) {
            return '';
        }
    };

    useEffect(() => {
        if (!shouldShowCaseInsights) {
            return;
        }
        if (statsResponse?.length && selectedSubprocess) {
            getOpenAiSummary(statsResponse, selectedSubprocess).then(summary => {
                if (summary) {
                    setAiSummary(summary);
                }
            });
        } else {
            setAiSummary(`No exceptions for ${dashboardChartTitleFormat(selectedSubprocess)}.`);
        }
    }, [loading, statsResponse, selectedSubprocess, shouldShowCaseInsights]);

    return (
        <CardContainer containerClassNames="rounded" classNames="!p-0" fullWidth={true}>
            <div className="flex flex-col xl:flex-row justify-between gap-4 w-full">
                <div className="flex xl:flex-col xl:w-1/4 gap-4 mb-8 xl:mb-0">
                    <Typography className="mb-1" variant={TypographyVariant.H3}>
                        {'Exception Summary'}
                    </Typography>

                    <div className="flex-1 border-r-1 xl:border-r-0 border-[#EDEDED] flex flex-col gap-4 pt-4">
                        {loading ? (
                            <div className="grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                                <PageLoader />
                            </div>
                        ) : (
                            <>
                                {!!aiSummary?.length && (
                                    <>
                                        <div className="flex flow-col items-center align-middle gap-2">
                                            <LightBulbIcon height={'24px'} width={'24px'} />
                                            <Typography variant={TypographyVariant.LabelLg}>Insight</Typography>
                                        </div>
                                        <Typography variant={TypographyVariant.BodySm}>{aiSummary}</Typography>
                                    </>
                                )}
                            </>
                        )}
                        <Typography className="xl:mt-1" variant={TypographyVariant.BodySmBold}>
                            Avg Monthly Exceptions / Total Cases
                        </Typography>
                        <table>
                            <thead>
                                <tr>
                                    <th className={`text-left ${styles.th}`}>{splitAndSentenceCase(groupBy)}</th>
                                    <th className={`text-right ${styles.th}`}>Monthly Avg. / Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMonthly.map((stat, index) => (
                                    <tr key={`stat-${index}-${stat.name}`}>
                                        <td className="text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="h-3 w-3" style={{ backgroundColor: colors[index] }}></div>
                                                <NavElement
                                                    href={`/cases${convertToQueryString(filter as any)}`}
                                                    size={NavElementSize.Small}
                                                    type={NavElementType.Link}
                                                    className="capitalize"
                                                    target="_blank"
                                                >
                                                    {stat.name}
                                                </NavElement>
                                            </div>
                                        </td>
                                        <td className={`text-right ${styles.value}`}>
                                            {wholeNumberFormatify(stat.total / 12)} / {wholeNumberFormatify(stat.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="relative xl:w-3/4">
                    <div
                        style={{ height: '600px' }}
                        className={clsx('w-full h-[600px]', {
                            'grid gap-4 place-content-center bg-[--color-base-surface-surface-tertiary]': loading || !exceptionData,
                        })}
                    >
                        {loading ? (
                            <>
                                <PageLoader />
                                <Typography variant={TypographyVariant.BodyBold}>Loading...</Typography>
                            </>
                        ) : (
                            <>
                                {exceptionData ? (
                                    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={chartConfig} />
                                ) : (
                                    <div className="flex flex-col gap-2 items-center">
                                        <ChartBarsIcon height={'24px'} width={'24px'} />
                                        <Typography variant={TypographyVariant.BodyBold}>No exceptions</Typography>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </CardContainer>
    );
};
