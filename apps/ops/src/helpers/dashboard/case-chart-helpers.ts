import { SeriesOptionsType, XAxisOptions } from 'highcharts';

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
    getTreeMapColors: () => [
        '#DB004F',
        '#DE165E',
        '#E12D6E',
        '#E4447D',
        '#E85A8D',
        '#EB719C',
        '#EE88AC',
        '#F19FBB',
        '#F5B5CB',
        '#F8CCDA',
        '#FBE3EA',
        '#FFFAFA',
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
        navigation: { buttonOptions: { enabled: false } },
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
                let returnString = `<b>${
                    pointDate.getMonth() + 1
                }/${pointDate.getDate()}/${pointDate.getFullYear()}</b><br/>`;
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
                formatter: function (
                    this: Highcharts.AxisLabelsFormatterContextObject
                ): string {
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
        navigation: { buttonOptions: { enabled: false } },
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
    getBaseBarChartConfiguration: (): Highcharts.Options => ({
        navigation: { buttonOptions: { enabled: false } },
        chart: {
            type: 'bar',
            height: 400,
        },
        colors: caseChartHelpers.getColors(),
        title: {
            align: 'left',
            verticalAlign: 'top',
            y: 0,
            text: '',
        },
        xAxis: {
            categories: [],
            title: {
                text: null,
            },
            gridLineWidth: 0,
            lineWidth: 0,
            labels: {
                useHTML: true, //Set to true
                style: {
                    width: 150,
                    whiteSpace: 'normal', //set to normal
                    textAlign: 'right',
                },
                step: 1,
                formatter: function (
                    this: Highcharts.AxisLabelsFormatterContextObject
                ) {
                    //use formatter to break word.
                    return (
                        '<div align="center" style="word-wrap: break-word;width:150px">' +
                        this.value +
                        '</div>'
                    );
                },
            },
        } as XAxisOptions,
        yAxis: {
            min: 0,
            labels: {
                overflow: 'justify',
            },
            gridLineWidth: 1,
            lineWidth: 0,
            title: {
                text: null,
            },
        },
        tooltip: {},
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: false,
                },
                groupPadding: 0.1,
                stacking: 'normal',
                pointWidth: 20,
            },
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            floating: false,
            title: {
                text: 'Case submissions', // Legend title
                style: {
                    fontWeight: 'bold', // Bold font for title
                    display: 'inline-block', // Keep inline with legend items
                    marginRight: '10px', // Add spacing
                },
            },
            useHTML: true, // Enable custom HTML for styling
        },
        credits: {
            enabled: false,
        },
        series: [],
    }),
};

export default caseChartHelpers;
