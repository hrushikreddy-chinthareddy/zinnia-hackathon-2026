import Highcharts, { Point, Series, SeriesOptionsType } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC, useMemo } from 'react';

interface ComparisonColumnChartProps {
    series: SeriesOptionsType[];
    categories: string[];
    title?: string;
    colors: string[];
    yAxisTitle: string;
    xAxisTitle?: string;
    height?: number;
    width?: number;
    legendFormatter?: Highcharts.FormatterCallbackFunction<Point | Series>;
}

export const ComparisonColumnChart: FC<ComparisonColumnChartProps> = ({
    series,
    categories,
    title,
    colors,
    yAxisTitle,
    height,
    width,
    xAxisTitle,
    legendFormatter,
}) => {
    const chartOptions: Highcharts.Options = useMemo(
        () => ({
            chart: {
                type: 'column',
                height: height,
                width: width,
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
                title: {
                    text: !xAxisTitle
                        ? undefined
                        : `<div class="typography-labels-label-md">${xAxisTitle}</div>`,
                    useHtml: !xAxisTitle ? false : true,
                },
                labels: {
                    enabled: false,
                },
            },
            yAxis: {
                min: 0,
                title: {
                    text: `<div class="typography-labels-label-md">${yAxisTitle}</div>`,
                    useHtml: true,
                },
            },
            legend: {
                enabled: true,
                symbolRadius: 3,
                symbolHeight: 12,
                symbolWidth: 12,
                ...(legendFormatter && { labelFormatter: legendFormatter }),
                layout: 'vertical',
                itemStyle: {
                    fontSize: '14px',
                    paddingTop: '2px',
                },
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                },
            },

            series: [
                {
                    color: 'rgba(158, 159, 163, 0.5)',
                    pointPlacement: 0.12 as unknown as string, //this is dumb, but it does work. If you try to use the string version it wont work

                    ...series[0],
                },
                {
                    id: 'main',
                    ...series[1],
                },
            ],
        }),
        [
            height,
            width,
            title,
            colors,
            categories,
            xAxisTitle,
            yAxisTitle,
            legendFormatter,
            series,
        ]
    );
    return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};
