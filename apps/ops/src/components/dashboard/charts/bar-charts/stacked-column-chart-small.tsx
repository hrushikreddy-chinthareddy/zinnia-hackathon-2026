import * as changeCase from 'change-case';
import Highcharts, { XAxisOptions } from 'highcharts';
import more from 'highcharts/highcharts-more';
// import accessibility from 'highcharts/modules/accessibility';
import HighchartsReact from 'highcharts-react-official';
import { useState, useEffect, useCallback } from 'react';

import caseChartHelpers, { ChartConfigSeriesDataSimple } from '@deps/helpers/dashboard/case-chart-helpers';
import { CaseDashboardStatsResponse } from '@deps/models/case/case';

//https://www.npmjs.com/package/highcharts-react-official#highcharts-with-nextjs
if (typeof Highcharts === 'object') {
    more(Highcharts);
}

interface Props {
    statGrouping?: CaseDashboardStatsResponse;
    startDate: Date;
    endDate: Date;
    title: string;
}

const SmallStackedColumnChart = ({ statGrouping, startDate, endDate, title }: Props) => {
    const [chartConfig, setChartConfig] = useState<Highcharts.Options>({});

    const getSeriesData = (statGrouping: CaseDashboardStatsResponse | undefined, startDate: Date, endDate: Date) => {
        const seriesData: ChartConfigSeriesDataSimple[] = [];

        statGrouping?.data?.forEach(currentStatGrouping => {
            const chartSeriesItem = {
                name: (currentStatGrouping.name ?? 'Unknown') as string,
                data: [] as number[],
            } as ChartConfigSeriesDataSimple;

            for (let loopDate = new Date(startDate); loopDate < endDate; loopDate.setDate(loopDate.getDate() + 1)) {
                const dateStr = `${loopDate.getFullYear()}-${loopDate.getMonth() + 1}-${loopDate.getDate()}`;
                const stat = currentStatGrouping.values?.find(statGrouping => statGrouping.name === dateStr);
                if (stat) {
                    chartSeriesItem.data.push(stat.count);
                } else {
                    chartSeriesItem.data.push(0);
                }
            }
            seriesData.push(chartSeriesItem);
        });
        return seriesData;
    };

    const getChartConfig = useCallback(
        (seriesData: ChartConfigSeriesDataSimple[], startDate: Date, text: string) => {
            const seriesDataWithLabelFormatted = seriesData.map((series: ChartConfigSeriesDataSimple) => {
                return {
                    ...series,
                    name: changeCase.capitalCase(series.name),
                };
            });

            const config = caseChartHelpers.getBaseSmallBarConfiguration();
            if (config && config.title && config.title) {
                config.title.text = text;
            }

            if (config && config.xAxis) {
                config.xAxis = config.xAxis as XAxisOptions;
                config.xAxis.categories = [];

                for (let loopDate = new Date(startDate); loopDate < endDate; loopDate.setDate(loopDate.getDate() + 1)) {
                    config.xAxis.categories.push(loopDate.getTime().toString());
                }

                if (config.xAxis.labels && seriesDataWithLabelFormatted.length > 0) {
                    if (seriesDataWithLabelFormatted[0].data.length <= 10) {
                        config.xAxis.labels.step = 1;
                    } else if (seriesDataWithLabelFormatted[0].data.length <= 14) {
                        config.xAxis.labels.step = 2;
                    } else if (seriesDataWithLabelFormatted[0].data.length <= 30) {
                        config.xAxis.labels.step = 3;
                    } else if (seriesDataWithLabelFormatted[0].data.length <= 60) {
                        config.xAxis.labels.step = 5;
                    } else if (seriesDataWithLabelFormatted[0].data.length <= 90) {
                        config.xAxis.labels.step = 12;
                    } else if (seriesDataWithLabelFormatted[0].data.length <= 120) {
                        config.xAxis.labels.step = 12;
                    } else {
                        config.xAxis.labels.step = undefined;
                    }
                }
            }

            if (config) {
                config.series = [...seriesDataWithLabelFormatted];
            }

            return config;
        },
        [endDate] // add any dependencies here
    );

    useEffect(() => {
        const seriesData = getSeriesData(statGrouping, startDate, endDate);
        const config = getChartConfig(seriesData, startDate, title);
        setChartConfig(config);
    }, [statGrouping, startDate, endDate, title, getChartConfig]);

    return <HighchartsReact highcharts={Highcharts} options={chartConfig} />;
};

export default SmallStackedColumnChart;
