import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FC } from 'react';

import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';

export type GroupedColumnSeries = {
    name: string;
    data: number[];
    color?: string;
};

export const AXIS_TITLE_STYLE: Highcharts.CSSObject = {
    color: '#212121',
    fontSize: '14px',
    fontWeight: '700',
};

type Props = {
    categories: string[];
    series: GroupedColumnSeries[];
    xAxisTitle?: string;
    yAxisTitle?: string;
    height?: number;
    pointWidth?: number;
    groupPadding?: number;
    tooltipFormatter?: Highcharts.TooltipFormatterCallbackFunction;
};

const defaultCategoryValueTooltip: Highcharts.TooltipFormatterCallbackFunction =
    function () {
        const category = String(this.x);
        const seriesName = this.series?.name ?? '';
        const value =
            typeof this.y === 'number' ? this.y.toString() : String(this.y);
        return `<b>${category}</b><br/>${seriesName}: <b>${value}</b>`;
    };

export const GroupedColumnsChart: FC<Props> = ({
    categories,
    series,
    xAxisTitle = '',
    yAxisTitle = '',
    height = 495,
    pointWidth = 8,
    groupPadding,
    tooltipFormatter,
}) => {
    const base = caseChartHelpers.getBaseBarChartConfiguration();

    const options: Highcharts.Options = Highcharts.merge(base, {
        chart: { type: 'column', height, spacingBottom: 40 },

        legend: { ...base.legend, enabled: false, title: { text: '' } },

        xAxis: {
            ...base.xAxis,
            categories,
            title: { text: xAxisTitle, y: 12, style: AXIS_TITLE_STYLE },
            gridLineWidth: 1,
            labels: {
                useHTML: false,
                rotation: -45.604,
                style: {
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#212121',
                },
            },
        },

        yAxis: {
            ...base.yAxis,
            title: { text: yAxisTitle, style: AXIS_TITLE_STYLE },
            allowDecimals: false,
            tickAmount: 5,
        },

        plotOptions: {
            column: {
                pointWidth,
                ...(groupPadding !== undefined ? { groupPadding } : {}),
                dataLabels: { enabled: false },
            },
        },

        tooltip: {
            formatter: tooltipFormatter ?? defaultCategoryValueTooltip,
            useHTML: true,
        },

        series: series.map((s) => ({
            type: 'column',
            name: s.name,
            data: s.data,
            color: s.color,
        })),
    });

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};
