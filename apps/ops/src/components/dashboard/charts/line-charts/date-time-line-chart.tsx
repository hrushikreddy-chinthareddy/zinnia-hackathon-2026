import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC } from 'react';

interface DateTimeLineChartProps {
    tickInterval?: number;
    series: Highcharts.SeriesOptions[];
    yAxisTitle?: string;
    xAxisTitle?: string;
    tooltipFormatter?: Highcharts.TooltipFormatterCallbackFunction | undefined;
    xAxisLabelFormatter?:
        | Highcharts.AxisLabelsFormatterCallbackFunction
        | undefined;
    colors?: string[];
    yAxisOpposite?: boolean;
}

export const DateTimeLineChart: FC<DateTimeLineChartProps> = ({
    tickInterval,
    series,
    yAxisTitle,
    xAxisTitle,
    tooltipFormatter,
    xAxisLabelFormatter,
    colors,
    yAxisOpposite = true,
}) => {
    const chartConfig = {
        legend: {
            enabled: false,
        },
        credits: {
            enabled: false,
        },
        chart: {
            height: 300,
            type: 'datetime',
        },
        tooltip: {
            shared: true,

            formatter: tooltipFormatter,
            useHTML: true,
        },
        title: {
            text: undefined,
        },
        exporting: {
            enabled: false,
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false,
                },
            },
        },
        xAxis: {
            gridLineWidth: 1,
            type: 'datetime',
            tickInterval,
            labels: {
                formatter: xAxisLabelFormatter,
                style: {
                    color: '#212121',
                },
            },
            title: {
                text: xAxisTitle,
                style: {
                    color: '#212121',
                },
            },
        },
        yAxis: {
            opposite: yAxisOpposite,
            labels: {
                style: {
                    color: '#212121',
                },
            },
            title: {
                text: yAxisTitle,
                rotation: -90,
                x: yAxisOpposite ? 10 : -10,
                style: {
                    fontWeight: 700,
                    fontSize: '12px',
                    color: '#212121',
                },
            },
        },
        colors,
        series,
    };

    return <HighchartsReact highcharts={Highcharts} options={chartConfig} />;
};
