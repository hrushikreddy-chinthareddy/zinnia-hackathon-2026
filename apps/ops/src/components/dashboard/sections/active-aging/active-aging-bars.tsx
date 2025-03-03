import * as changeCase from 'change-case';
import Highcharts, { AxisLabelsFormatterContextObject } from 'highcharts';
import more from 'highcharts/highcharts-more'; // is this required?
import HighchartsReact, { HighchartsReactRefObject } from 'highcharts-react-official';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import caseChartHelpers, { ChartConfigSeriesDataSimple } from '@deps/helpers/dashboard/case-chart-helpers';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { CaseDashboardStatsResponse } from '@deps/models/case/case';

//https://www.npmjs.com/package/highcharts-react-official#highcharts-with-nextjs
if (typeof Highcharts === 'object') {
    more(Highcharts);
}

interface Props {
    agingRangesByProcess?: CaseDashboardStatsResponse;
    classNames?: string;
    onRenderChart?: () => void;
}

const ActiveAgingBars = forwardRef<HighchartsReactRefObject, Props>(({ agingRangesByProcess, classNames, onRenderChart }, ref) => {
    const [chartConfig, setChartConfig] = useState<Highcharts.Options>({});
    const [seriesData, setSeriesData] = useState<ChartConfigSeriesDataSimple[]>([]);

    const getSeriesData = (agingRangesByProcess?: CaseDashboardStatsResponse) => {
        const seriesData: ChartConfigSeriesDataSimple[] = [];
        if (!agingRangesByProcess || !agingRangesByProcess.data || agingRangesByProcess.data.length === 0) {
            return seriesData;
        }
        agingRangesByProcess.data.forEach(currentProcessStats => {
            const chartSeriesItem = {
                name: (currentProcessStats.name ?? 'Unknown') as string,
                data: [] as number[],
            } as ChartConfigSeriesDataSimple;

            currentProcessStats.values?.forEach(aging => {
                chartSeriesItem.data.push(aging.count);
            });

            seriesData.push(chartSeriesItem);
        });
        return seriesData;
    };

    const getChartConfig = useCallback(
        (seriesData: ChartConfigSeriesDataSimple[]) => {
            const seriesDataWithLabelFormatted = seriesData.map((series: ChartConfigSeriesDataSimple) => {
                return {
                    ...series,
                    name: changeCase.capitalCase(series.name),
                };
            });

            const config: Highcharts.Options = {
                navigation: { buttonOptions: { enabled: false } },
                chart: {
                    backgroundColor: 'transparent',
                    type: 'column',
                    spacingBottom: 1,
                    spacingRight: 0,
                    events: {
                        render: () => {
                            onRenderChart?.();
                        },
                    },
                },
                colors: caseChartHelpers.getAlternativeColors(),
                title: {
                    text: undefined,
                },
                xAxis: {
                    categories: ['0-7', '8-14', '15-30', '31-45', '46-59', '60+'],
                    opposite: true,
                    gridLineColor: '#ddd',
                    lineColor: '#ddd',
                    gridLineWidth: 0,
                    labels: {
                        enabled: false,
                        style: {
                            borderRadius: 1,
                            padding: '5px',
                            border: '1px solid #ddd',
                        },
                        formatter: function (this: AxisLabelsFormatterContextObject) {
                            return this.value.toString();
                        },
                    },
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Volume',
                        align: 'middle',
                        style: {
                            fontWeight: 'medium',
                            fontSize: '16px',
                            color: '#000',
                        },
                    },
                    stackLabels: {
                        enabled: false,
                    },
                    labels: {
                        align: 'right',
                    },
                    showFirstLabel: false,
                },
                legend: {
                    enabled: false,
                },
                tooltip: {
                    shared: false,
                    formatter: function (this: Highcharts.TooltipFormatterContextObject) {
                        let returnString = `<b>${this.point.category} days aging</b><br/>`;
                        returnString += `${this.series.userOptions.name ? this.series.userOptions.name : 'Unknown'}: ${wholeNumberFormatify(
                            this.y
                        )}<br/>`;
                        // NOTE: Below code will work if shared: true is set in tooltip
                        // allSeries.forEach(function (ser) {
                        //     if (ser.options.stack === thisPoint.series.options.stack) {
                        //         returnString += `${ser.name ? ser.name : 'Unknown'}: ${wholeNumberFormatify(ser.points[thisIndex].y)}<br/>`;
                        //     }
                        // });

                        // returnString += `<b>Total:</b> ${wholeNumberFormatify(this.point.total)}`;

                        return returnString;
                    },
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: false,
                        },
                    },
                },
                series: [...seriesDataWithLabelFormatted],
                credits: {
                    enabled: false,
                },
            };

            return config;
        },
        [onRenderChart]
    );

    useEffect(() => {
        const seriesData = getSeriesData(agingRangesByProcess);
        const config = getChartConfig(seriesData);
        setSeriesData(seriesData);
        setChartConfig(config);
    }, [getChartConfig, agingRangesByProcess, agingRangesByProcess?.data?.length]);

    return seriesData.length > 0 && <HighchartsReact ref={ref} className={classNames} highcharts={Highcharts} options={chartConfig} />;
});

ActiveAgingBars.displayName = 'ActiveAgingBars';

export default ActiveAgingBars;
