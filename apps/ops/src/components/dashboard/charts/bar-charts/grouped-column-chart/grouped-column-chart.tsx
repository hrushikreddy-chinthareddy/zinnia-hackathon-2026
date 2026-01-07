import Drilldown from 'highcharts/modules/drilldown';
import HighchartsReact from 'highcharts-react-official';
import { FC } from 'react';

import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import Highcharts from '@deps/utils/highcharts';

import {
    AXIS_LABEL_STYLE,
    AXIS_TITLE_STYLE,
    DRILLDOWN_STYLES,
} from './grouped-column-chart.styles';

if (typeof Highcharts === 'object') {
    Drilldown(Highcharts);
}
export type GroupedColumnSeries = {
    name: string;
    data: any[];
    color?: string;
    colorByPoint?: boolean;
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
    labelRotation?: number;
    enableDrilldown?: boolean;
    drilldownSeries?: Highcharts.SeriesOptionsType[];
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
    labelRotation = 0,
    enableDrilldown = false,
    drilldownSeries,
}) => {
    const base = caseChartHelpers.getBaseBarChartConfiguration();
    const commonXAxisConfig = {
        title: {
            text: xAxisTitle,
            y: 12,
            style: AXIS_TITLE_STYLE,
        },
        gridLineWidth: 1,
        labels: {
            useHTML: false,
            rotation: labelRotation,
            style: {
                ...AXIS_LABEL_STYLE,
            },
        },
    };

    const options: Highcharts.Options = Highcharts.merge(base, {
        chart: { type: 'column', height, spacingBottom: 40 },

        legend: { ...base.legend, enabled: false, title: { text: '' } },

        xAxis: enableDrilldown
            ? {
                  type: 'category',
                  categories: undefined,
                  ...commonXAxisConfig,
              }
            : {
                  ...base.xAxis,
                  categories,
                  ...commonXAxisConfig,
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
            colorByPoint: s.colorByPoint,
        })),
        ...(enableDrilldown
            ? {
                  drilldown: {
                      animation: { duration: 500 },
                      breadcrumbs: {
                          showFullPath: true,
                          buttonTheme: DRILLDOWN_STYLES.breadcrumbs.buttonTheme,
                          separator: DRILLDOWN_STYLES.breadcrumbs.separator,
                      },
                      activeAxisLabelStyle: DRILLDOWN_STYLES.activeAxisLabel,
                      series: drilldownSeries,
                  },
              }
            : {}),
    });

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};
