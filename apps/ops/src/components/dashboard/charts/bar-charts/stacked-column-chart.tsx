import Highcharts, { SeriesOptionsType } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC, useMemo } from 'react';

interface StackedColumnChartProps {
    series: SeriesOptionsType[];
    categories: string[];
    title?: string;
    colors: string[];
    yAxisTitle: string;
}

export const StackedColumnChart: FC<StackedColumnChartProps> = ({
    series,
    categories,
    title,
    colors,
    yAxisTitle,
}) => {
    const chartOptions: Highcharts.Options = useMemo(
        () => ({
            chart: {
                type: 'column',
                height: 400,
            },
            title: {
                text: title,
            },
            credits: {
                enabled: false,
            },
            navigation: {
                buttonOptions: {
                    enabled: false,
                },
            },
            colors,
            xAxis: {
                type: 'category',
                categories,
            },
            yAxis: {
                min: 0,
                title: {
                    text: `<div class="typography-labels-label-md">${yAxisTitle}</div>`,
                    useHtml: true,
                },
            },
            legend: {
                enabled: false,
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                },
                series: {
                    borderWidth: 0,
                },
            },
            tooltip: {
                headerFormat:
                    '<span style="font-size:11px">{series.name}</span><br />',
            },
            series,
        }),
        [title, colors, categories, yAxisTitle, series]
    );
    return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};
