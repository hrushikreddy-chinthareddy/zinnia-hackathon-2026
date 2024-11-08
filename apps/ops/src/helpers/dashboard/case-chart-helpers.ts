import { SeriesOptionsType } from 'highcharts';

import { Case } from '@deps/models/case/case';

export interface ChartSeriesData {
    x: string | Date | number;
    y: string | Date | number;
    additionalData: string | Date | number;
}

export interface ChartSeriesDataIndex {
    [key: string]: ChartSeriesData;
}

export interface ChartConfigSeriesData {
    name: string;
    data: ChartSeriesData[];
}
export type ChartConfigSeriesDataSimple = SeriesOptionsType & {
    name: string;
    data: number[];
};

export interface CaseGrouping {
    [key: string]: Case[];
}

const caseChartHelpers = {
    agingLabel: 'In Progress (aging)',
    unMappedStatus: 'Unknown',
    unMappedProcess: 'Unknown',
    caseStatuses: ['In Progress', 'Completed', 'NIGO', 'In Progress (aging)'],
    caseProcesses: [
        'New Business',
        'Outgoing Fund Transfer',
        'Loan Repayment One Time',
        'Loan',
        'One Time Premium',
        'Policy Update',
        'Systematic Program Update',
        'Renewal',
        'Required Minimum Distribution',
        'Withdrawal',
        'Unknown',
    ],
    getColors: () => [
        '#87bf54',
        '#65bda5',
        '#50bcbf',
        '#00b3e1',
        '#5da0d7',
        '#927db6',
        '#c78dbd',
        '#f08ab1',
        '#f1969b',
        '#f6a570',
        '#fdca54',
        '#fee327',
    ],
    getAlternativeColors: function () {
        return this.getColors().reverse();
    },
    getBaseSmallBarConfiguration: (): Highcharts.Options => ({
        chart: {
            type: 'column',
            width: 200,
            height: 200,
        },
        colors: caseChartHelpers.getColors(),
        title: {
            align: 'left',
            verticalAlign: 'top',
        },
        tooltip: {
            shared: true,
            formatter: function () {
                const thisPoint = this.point;
                const allSeries = this.series.chart.series;
                const thisIndex = thisPoint.index;
                const pointDate = new Date(Number(this.point.category));
                let returnString = `<b>${pointDate.getMonth() + 1}/${pointDate.getDate()}/${pointDate.getFullYear()}</b><br/>`;
                allSeries.forEach(function (ser) {
                    if (ser.options.stack === thisPoint.series.options.stack) {
                        returnString += `${ser.name} ${ser.points[thisIndex].y}<br/>`;
                    }
                });

                returnString += `<b>Total:</b> ${this.point.total}`;

                return returnString;
            },
        },
        subtitle: undefined,
        yAxis: {
            visible: false,
            min: 0,
        } as Highcharts.YAxisOptions,
        xAxis: {
            accessibility: {
                rangeDescription: 'All time',
            },
            labels: {
                step: 1,
                distance: 6,
                style: {
                    color: '#999',
                },
                formatter: function (this: Highcharts.AxisLabelsFormatterContextObject): string {
                    return new Date(Number(this.value)).getDate().toString();
                },
            },
            type: 'category',
            categories: [],
            visible: true,
            lineWidth: 0,
            maxPadding: 0,
        } as Highcharts.XAxisOptions,
        legend: {
            align: 'right',
            verticalAlign: 'bottom',
            layout: 'vertical',
            width: 80,
            padding: 0,
            navigation: {
                enabled: true,
            },
            enabled: false,
            maxHeight: 100,
        },
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false,
                },
                marker: {
                    enabled: false,
                },
            },
            column: {
                stacking: 'normal',
                centerInCategory: true,
                pointPadding: 0.01,
                pointWidth: 8,
                grouping: true,
                groupPadding: 0,
            },
        },
        responsive: {
            rules: [
                {
                    chartOptions: {
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                        },
                    },
                },
            ],
        },
        credits: {
            enabled: false,
        },
    }),
    getBaseSmallPieConfiguration: (): Highcharts.Options => ({
        chart: {
            type: 'pie',
            spacing: [0, 0, 0, 0],
            height: 182,
            margin: [0, 80, 0, 0],
            backgroundColor: 'transparent',
        },
        colors: caseChartHelpers.getColors(),
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
                thickness: 28,
            },
        },
        legend: {
            align: 'right',
            verticalAlign: 'bottom',
            layout: 'vertical',
            width: 80,
            padding: 10,
            navigation: {
                enabled: true,
            },
            enabled: true,
            maxHeight: 120,
            itemStyle: {
                fontSize: '12px',
            },
        },
        credits: {
            enabled: false,
        },
    }),
};

export default caseChartHelpers;
