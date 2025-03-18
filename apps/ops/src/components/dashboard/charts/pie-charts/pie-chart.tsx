import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

interface LegendItemProps {
    name: string;
    count: number;
}

export interface PieChartProps {
    colors: string[];
    series: Highcharts.SeriesOptions[];
}

const LegendItem: FC<LegendItemProps> = ({ name, count }) => {
    return (
        <div className="flex justify-between w-[150px]">
            <div>{name}</div>
            <div>{count.toLocaleString()}</div>
        </div>
    );
};

export const PieChart: FC<PieChartProps> = ({ colors, series }) => {
    const options = {
        navigation: { buttonOptions: { enabled: false } },

        chart: {
            type: 'pie',
            spacing: [10, 10, -10, 10],
            height: 280,
            marginBottom: 80,
            backgroundColor: 'transparent',
        },
        colors,
        title: {
            align: 'left',
            verticalAlign: 'top',
            y: 0,
            text: '',
        },
        tooltip: {
            pointFormat: `<b>{point.percentage:.0f}%</b> of {series.name}`,
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: false,
                },
                showInLegend: true,
                thickness: 28,
            },
        },
        legend: {
            align: 'center',
            verticalAlign: 'bottom',

            width: 200,
            padding: 10,
            navigation: {
                enabled: true,
            },
            useHTML: true,
            labelFormatter: function (this: Highcharts.Point) {
                return renderToStaticMarkup(<LegendItem name={this.name} count={this.y || 0} />);
            },
            symbolRadius: 3,
            symbolHeight: 12,
            symbolWidth: 12,
            enabled: true,
            itemStyle: {
                fontSize: '14px',
                paddingTop: '2px',
            },
        },

        credits: {
            enabled: false,
        },
        series,
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};
